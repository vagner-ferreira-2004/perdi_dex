class ServiceError(Exception):
    status_code = 400


class ConflictError(ServiceError):
    status_code = 409


class NotFoundError(ServiceError):
    status_code = 404


class AuthenticationError(ServiceError):
    status_code = 401


class AuthorizationError(ServiceError):
    status_code = 403
