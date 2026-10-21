from typing import Literal

from pydantic import BaseModel, ConfigDict


class UpdateStatusSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["Pendente", "Encontrado", "Devolvido"]