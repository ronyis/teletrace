/**
 * Copyright 2022 Cisco Systems, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Chip, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

import { useSpanSearchStore } from "../../stores/spanSearchStore";
import { FilterValueTypes, SearchFilter } from "../../types/common";
import { FilterBuilderDialog } from "../FilterBuilder";
import { styles } from "./styles";

const OPERATORS_FORMAT: Record<string, string> = {
  in: "IN",
  not_in: "NOT IN",
  contains: "CONTAINS",
  not_contains: "NOT CONTAINS",
  exists: "EXISTS",
  not_exists: "NOT EXISTS",
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
};

const MAX_FILTER_LENGTH = 100;

export type FilterChipProps = {
  filter: SearchFilter;
};

export const FilterChip = ({ filter }: FilterChipProps) => {
  const deleteFilter = useSpanSearchStore(
    (state) => state.filtersState.deleteFilter
  );
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    setOpenEditDialog(true);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setOpenEditDialog(false);
  };

  const getTooltipForArray = (arrValue: (number | string)[]) => {
    return arrValue.map((value: number | string) => (
      <Typography key={value}> • {value}</Typography>
    ));
  };

  const getTooltipTitle = () => {
    const value = filter.keyValueFilter.value;
    const newValue = Array.isArray(value)
      ? getTooltipForArray(value)
      : filter.keyValueFilter.value;
    return (
      <>
        <Typography>
          {filter.keyValueFilter.key}
          {` ${OPERATORS_FORMAT[filter.keyValueFilter.operator]}`}
        </Typography>
        {newValue}
      </>
    );
  };

  const formatStrValue = (value: string, filterLength: number) => {
    if (filterLength > MAX_FILTER_LENGTH) {
      value = `${value.substring(0, MAX_FILTER_LENGTH)}...`;
    }
    return `"${value}"`;
  };

  const formatArrayValue = (value: (string | number)[], filterLen: number) => {
    const arrLen = value.length;
    let newValue;
    if (value.length === 0) {
      return "";
    }
    if (typeof value[0] === "string") {
      if (arrLen > 1) {
        newValue = `["${value[0]}"...+${arrLen - 1}]`;
      } else {
        newValue = formatStrValue(value[0], filterLen);
      }
    } else {
      if (arrLen > 1) {
        newValue = `[${value[0]}...+${arrLen - 1}]`;
      } else {
        newValue = value[0];
      }
    }
    return newValue;
  };

  const formatFilterValue = (value: FilterValueTypes) => {
    const filterLen = getFilterLength();
    if (typeof value === "string") {
      return formatStrValue(value, filterLen);
    } else if (Array.isArray(value)) {
      return formatArrayValue(value, filterLen);
    } else {
      return value;
    }
  };

  const getFilterLength = () => {
    return (
      `${filter.keyValueFilter.key}`.length +
      `${filter.keyValueFilter.operator}`.length +
      `${filter.keyValueFilter.value}`.length
    );
  };

  const buildFilterLabel = (
    key: string,
    operator: string,
    value: FilterValueTypes
  ) => {
    operator = OPERATORS_FORMAT[operator];
    const newValue = formatFilterValue(value);
    return `${key} ${operator} ${newValue}`;
  };

  return (
    <>
      <Tooltip
        title={getTooltipTitle()}
        placement="top-end"
        arrow
        PopperProps={{ sx: styles.tooltipPopper }}
      >
        <Chip
          size="small"
          label={buildFilterLabel(
            filter.keyValueFilter.key,
            filter.keyValueFilter.operator,
            filter.keyValueFilter.value
          )}
          onDelete={() =>
            deleteFilter(
              filter.keyValueFilter.key,
              filter.keyValueFilter.operator
            )
          }
          onClick={handleOpen}
        />
      </Tooltip>
      <FilterBuilderDialog
        open={openEditDialog}
        onClose={handleClose}
        anchorEl={anchorEl}
        initialFilter={filter.keyValueFilter}
      />
    </>
  );
};
