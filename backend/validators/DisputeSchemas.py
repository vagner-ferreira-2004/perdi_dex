from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class CreateDisputeSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    description: str = Field(min_length=20, max_length=2000)

    @field_validator("description")
    @classmethod
    def stripDescription(cls, value: str) -> str:
        return value.strip()


class ListDisputesSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Optional[Literal["Pendente", "Resolvida"]] = "Pendente"
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=25, ge=1, le=100)


class ListEligibleDisputeItemsSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


class ListUserDisputesSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


class ReviewDisputeSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decision: Literal["accept", "reject"]
    reason: Optional[str] = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def requireReasonWhenRejected(self):
        cleaned = self.reason.strip() if self.reason else None
        if self.decision == "reject" and not cleaned:
            raise ValueError("reason is required when rejecting a dispute")
        self.reason = cleaned
        return self
