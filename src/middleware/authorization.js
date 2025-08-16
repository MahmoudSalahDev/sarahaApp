export const authorization = (accessRoles = []) => {
    return (req, res, next) => {
        if (!accessRoles.includes(req?.user?.role)) {
            throw new Error("user not Authorized!", { cause: 401 })
        }

        return next()
    }
}