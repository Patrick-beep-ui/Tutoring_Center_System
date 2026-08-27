import React, { useMemo } from "react";
import { tableFeatures, useTable } from "@tanstack/react-table";

import { RowActions } from "@/components/shared/RowActions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const DATA_TABLE_FEATURES = tableFeatures({});
const EMPTY_DATA = [];
const EMPTY_COLUMNS = [];

function DataTableLoading({ columnCount, rowCount }) {
  return Array.from({ length: rowCount }, (_, rowIndex) => (
    <TableRow key={`loading-row-${rowIndex}`} aria-hidden="true">
      {Array.from({ length: columnCount }, (_, columnIndex) => (
        <TableCell
          key={`loading-cell-${rowIndex}-${columnIndex}`}
          className="px-4 py-3"
        >
          <Skeleton className="h-4 w-full max-w-40" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function DataTableEmpty({ columnCount, children }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={columnCount}
        className="h-28 px-4 text-center text-sm text-muted-foreground"
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

function DataTable({
  columns = EMPTY_COLUMNS,
  data = EMPTY_DATA,
  loading = false,
  loadingRowCount = 5,
  emptyMessage = "No records found.",
  getRowKey,
  rowActions,
  rowActionsHeader = "Actions",
  rowActionsLabel = "Open row actions",
  caption,
  className,
  tableClassName,
  tableContainerClassName,
  headerClassName,
  bodyClassName,
  getRowClassName,
}) {
  const tableColumns = useMemo(() => {
    if (!rowActions) {
      return columns;
    }

    return [
      ...columns,
      {
        id: "row-actions",
        header: () => <span className="sr-only">{rowActionsHeader}</span>,
        cell: ({ row }) => {
          const actions =
            typeof rowActions === "function"
              ? rowActions(row.original)
              : rowActions;
          const label =
            typeof rowActionsLabel === "function"
              ? rowActionsLabel(row.original)
              : rowActionsLabel;

          return (
            <div className="flex justify-end">
              <RowActions actions={actions} context={row.original} label={label} />
            </div>
          );
        },
        meta: {
          headerClassName: "w-12 text-right",
          cellClassName: "w-12 text-right",
        },
      },
    ];
  }, [columns, rowActions, rowActionsHeader, rowActionsLabel]);

  const table = useTable({
    features: DATA_TABLE_FEATURES,
    columns: tableColumns,
    data,
    getRowId: getRowKey
      ? (row, index, parent) =>
          String(getRowKey(row, index, parent?.original))
      : undefined,
  });

  const columnCount = Math.max(table.getAllLeafColumns().length, 1);
  const rows = table.getRowModel().rows;
  const safeLoadingRowCount = Math.max(1, loadingRowCount);

  return (
    <div
      data-slot="data-table"
      className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <Table
        className={tableClassName}
        containerClassName={tableContainerClassName}
        aria-busy={loading}
      >
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader className={cn("bg-muted/80", headerClassName)}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={cn(
                    "h-11 px-4 text-xs font-semibold uppercase tracking-wide text-primary",
                    header.column.columnDef.meta?.headerClassName,
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className={bodyClassName}>
          {loading ? (
            <DataTableLoading
              columnCount={columnCount}
              rowCount={safeLoadingRowCount}
            />
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={getRowClassName?.(row.original, row)}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-4 py-3",
                      cell.column.columnDef.meta?.cellClassName,
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            emptyMessage !== null && (
              <DataTableEmpty columnCount={columnCount}>
                {emptyMessage}
              </DataTableEmpty>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export { DataTable, DataTableEmpty, DataTableLoading };
