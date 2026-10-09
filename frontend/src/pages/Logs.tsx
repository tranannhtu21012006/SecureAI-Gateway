import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RequestLog {
  id: string;
  timestamp: Date;
  keyName: string;
  provider: string;
  model: string;
  tokens: number;
  latency_ms: number;
  status: number;
}

const mockLogs: RequestLog[] = Array.from({ length: 45 }).map(() => ({
  id: `req_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(Date.now() - Math.random() * 100000000),
  keyName: Math.random() > 0.5 ? 'Production App' : 'Demo Project',
  provider: ['openai', 'gemini', 'anthropic'][Math.floor(Math.random() * 3)],
  model: ['gpt-4-turbo', 'gemini-1.5-pro', 'claude-3-sonnet'][Math.floor(Math.random() * 3)],
  tokens: Math.floor(Math.random() * 1000) + 50,
  latency_ms: Math.floor(Math.random() * 800) + 200,
  status: Math.random() > 0.1 ? 200 : [429, 400, 500][Math.floor(Math.random() * 3)],
}));

export default function Logs() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }: any) => format(row.getValue("timestamp"), "MMM dd, HH:mm:ss"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const s = row.getValue("status");
        return <Badge variant={s === 200 ? "default" : s === 429 ? "secondary" : "destructive"}>{s}</Badge>;
      }
    },
    {
      accessorKey: "keyName",
      header: "Key",
    },
    {
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }: any) => (
        <span className="capitalize text-gray-700 dark:text-gray-300">
          {row.getValue("provider")}
        </span>
      )
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }: any) => (
        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs text-indigo-600 dark:text-indigo-400">
          {row.getValue("model")}
        </code>
      )
    },
    {
      accessorKey: "tokens",
      header: "Tokens",
    },
    {
      accessorKey: "latency_ms",
      header: "Latency",
      cell: ({ row }: any) => `${row.getValue("latency_ms")}ms`
    },
  ];

  const table = useReactTable({
    data: mockLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Request Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time gateway traffic monitoring</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <Input
            placeholder="Search by key, provider, model..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm bg-gray-50 dark:bg-gray-900"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 font-medium"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {table.getRowModel().rows.length} of {mockLogs.length} requests
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
