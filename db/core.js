const createNamespacedContext = ({ namespaceGetter, dbInstGetter }) => {
    return ({
        push(dataObj) {
            return namespaceGetter(dbInstGetter())
              .push(dataObj)
              .write();
        },
        findById(id) {
            return namespaceGetter(dbInstGetter())
              .find({ id })
              .value();
        },
        getAll() {
            return namespaceGetter(dbInstGetter()).value();
        },
        set(path, value) {
            return namespaceGetter(dbInstGetter())
              .set(path, value)
              .write();
        },
        updateById(id, updatingData) {
            return namespaceGetter(dbInstGetter())
              .find({ id })
              .assign({ ...updatingData })
              .write();
        }
    });
};

module.exports = {
    createNamespacedContext,
};