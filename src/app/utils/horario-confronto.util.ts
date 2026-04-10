export function formatarHorarioConfronto(horario: string | null | undefined) {
    if (!horario) {
        return '';
    }

    if (/^\d{2}:\d{2}/.test(horario)) {
        return horario.slice(0, 5);
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
        return horario.slice(0, 5);
    }

    return horario;
}
