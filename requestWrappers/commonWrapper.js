const commonWrapper = (handlerFn) => async (req, res, next) => {
    try {
        const result = await handlerFn(req, res, next);
        res.status(200).json(result);
    } catch (e) {
        console.error(e);

        res.status(e.statusCode || 500).json({ message: e.message || 'Internal server error' });
    }
};

module.exports = commonWrapper;