from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ListPickupRequestsSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Optional[
        Literal["Pendente", "Aprovado", "Reprovado", "Cancelado", "Concluido"]
    ] = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=25, ge=1, le=100)


class ReviewPickupRequestSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decision: Literal["approve", "reject"]
    reason: Optional[str] = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def requireReasonWhenRejected(self):
        cleaned = self.reason.strip() if self.reason else None
        if self.decision == "reject" and not cleaned:
            raise ValueError("reason is required when rejecting a request")
        self.reason = cleaned
        return self
