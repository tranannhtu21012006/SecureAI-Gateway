import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Copy, Trash2, Plus, Key as KeyIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";

interface APIKey {
  id: string;
  name: string;
  is_active: boolean;
  rate_limit: number;
  created_at: string;
  last_used_at: string | null;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState(100);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fetchKeys = async () => {
    try {
      const { data } = await api.get('/api/v1/auth/api-keys');
      setKeys(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load API keys');
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/v1/auth/api-keys', { name: newKeyName, rate_limit: rateLimit });
      setCreatedKey(data.plain_key);
      setNewKeyName('');
      setRateLimit(100);
      fetchKeys();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create API key');
    }
  };

  const deleteKey = async (id: string) => {
    try {
      await api.delete(`/api/v1/auth/api-keys/${id}`);
      fetchKeys();
      toast.success('API key deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCreatedKey(null);
  };

  const columns: ColumnDef<APIKey>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <KeyIcon className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">{row.getValue("name")}</span>
          <Badge variant={row.original.is_active ? "default" : "destructive"} className="ml-2">
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "rate_limit",
      header: "Rate Limit",
      cell: ({ row }) => (
        <span className="text-gray-500 dark:text-gray-400">{row.getValue("rate_limit")} req/min</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        return <span className="text-gray-500 dark:text-gray-400">{new Date(row.getValue("created_at")).toLocaleDateString()}</span>
      },
    },
    {
      accessorKey: "last_used_at",
      header: "Last Used",
      cell: ({ row }) => {
        const val = row.getValue("last_used_at");
        return <span className="text-gray-500 dark:text-gray-400">{val ? new Date(val as string).toLocaleDateString() : 'Never'}</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const key = row.original;
        return (
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50" />}>
                <Trash2 className="w-4 h-4" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your API key "{key.name}" 
                    and any applications using it will immediately lose access.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteKey(key.id)} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ];

  const table = useReactTable({
    data: keys,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">API Keys</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> Create new secret key
            </Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create new secret key</DialogTitle>
              <DialogDescription>
                Please save this secret key somewhere safe and accessible. 
                For security reasons, you won't be able to view it again.
              </DialogDescription>
            </DialogHeader>

            {!createdKey ? (
              <form onSubmit={createKey} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    required 
                    placeholder="e.g. Production App" 
                    value={newKeyName} 
                    onChange={e => setNewKeyName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate Limit (requests / min)</label>
                  <Input 
                    type="number" 
                    required 
                    value={rateLimit} 
                    onChange={e => setRateLimit(Number(e.target.value))} 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">Create secret key</Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="py-4 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border rounded-lg flex items-center justify-between gap-4">
                  <code className="text-sm font-mono break-all">{createdKey}</code>
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(createdKey)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={closeDialog} className="w-full sm:w-auto">Done</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="pl-9 bg-gray-50 dark:bg-gray-900 border-none"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  No API keys found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
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
  );
}
