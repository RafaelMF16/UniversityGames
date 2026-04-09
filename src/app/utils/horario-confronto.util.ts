const FUSO_SAO_PAULO_OFFSET_MINUTOS = -180;
const UTC_OFFSET_MINUTOS = 0;

export function formatarHorarioConfronto(horario: string | null | undefined) {
    if (!horario) {
        return '';
    }

    if (/^\d{2}:\d{2}/.test(horario)) {
        return ajustarHorario(horario, FUSO_SAO_PAULO_OFFSET_MINUTOS - UTC_OFFSET_MINUTOS);
    }

    const data = new Date(horario);
    if (!Number.isNaN(data.getTime())) {
        return data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo'
        });
    }

    return horario;
}

export function normalizarHorarioConfrontoParaEnvio(horario: string | null | undefined) {
    if (!horario) {
        return '';
    }

    if (/^\d{2}:\d{2}/.test(horario)) {
        return ajustarHorario(horario, UTC_OFFSET_MINUTOS - FUSO_SAO_PAULO_OFFSET_MINUTOS);
    }

    return horario;
}

function ajustarHorario(horario: string, offsetMinutos: number) {
    const [hora, minuto] = horario.split(':').map((parte) => Number(parte));
    if (!Number.isFinite(hora) || !Number.isFinite(minuto)) {
        return horario;
    }

    const minutosNoDia = 24 * 60;
    const total = ((hora * 60 + minuto + offsetMinutos) % minutosNoDia + minutosNoDia) % minutosNoDia;
    const horaAjustada = Math.floor(total / 60).toString().padStart(2, '0');
    const minutoAjustado = (total % 60).toString().padStart(2, '0');

    return `${horaAjustada}:${minutoAjustado}`;
}
