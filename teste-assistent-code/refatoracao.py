from dataclasses import dataclass
from typing import Sequence


@dataclass(frozen=True)
class ListStatistics:
    total: float
    mean: float
    maximum: float
    minimum: float


def calculate_statistics(values: Sequence[float]) -> ListStatistics:
    """Compute the total, mean, maximum and minimum values from a non-empty list."""
    if not values:
        raise ValueError("A lista não pode estar vazia.")

    total = sum(values)
    mean = total / len(values)
    maximum = max(values)
    minimum = min(values)

    return ListStatistics(total=total, mean=mean, maximum=maximum, minimum=minimum)


def format_statistics(statistics: ListStatistics) -> str:
    """Format the statistics values for display."""
    return (
        f"total: {statistics.total}\n"
        f"media: {statistics.mean}\n"
        f"maior: {statistics.maximum}\n"
        f"menor: {statistics.minimum}"
    )


def main() -> None:
    """Entry point for executing the statistics summary."""
    values = [23, 7, 45, 2, 67, 12, 89, 34, 56, 11]
    statistics = calculate_statistics(values)
    print(format_statistics(statistics))


if __name__ == "__main__":
    main()
