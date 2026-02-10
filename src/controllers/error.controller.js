// eslint-disable-next-line
const ErrorController = (err, req, res, next) => {
    console.error('--- ERRO CAPTURADO PELO CONTROLLER ---');
    console.error(`Status: ${err.status || err.statusCode || 500}`);
    console.error('Mensagem:', err.message);

    const isClientError = (err.status >= 400 && err.status < 500) || (err.statusCode >= 400 && err.statusCode < 500);

    if (isClientError) {
        const status = err.statusCode || err.status || 400;

        if (err.details) {
            return res.status(status).json({
                status: 'error',
                message: err.message,
                errors: err.details,
            });
        }

        return res.status(status).json({
            status: 'error',
            message: err.message,
        });
    }

    const statusCode = err.status || 500;
    const message = statusCode === 500 && req.app.get('env') !== 'development'
        ? 'Erro interno do servidor.'
        : err.message;

    return res.status(statusCode).json({
        status: 'error',
        message: message,
    });
};

export default ErrorController;
