from typing import List

from sites.types import Record


def calculate_h_index(records: List[Record]) -> int:
    records.sort(key=lambda x: x.metric, reverse=True)
    for i, record in enumerate(records):
        if record.metric < i + 1:
            return i
    return len(records)
