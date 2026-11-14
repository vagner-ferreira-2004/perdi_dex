from werkzeug.security import check_password_hash, generate_password_hash


def hashPassword(password: str) -> str:
    return generate_password_hash(password)


def verifyPassword(password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, password)
