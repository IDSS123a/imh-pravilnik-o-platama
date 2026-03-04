import useSWR from 'swr';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table'; // Need to create Table
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge'; // Need to create Badge
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input'; // Need to create Input
import { useState } from 'react';
import { Search, Download, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Employees() {
  const { data: employees, error } = useSWR('/api/employees', fetcher);
  const [search, setSearch] = useState('');

  if (error) return <div>Failed to load</div>;
  if (!employees) return <div>Loading...</div>;

  const filtered = employees.filter((e: any) => 
    e.imeIPrezime.toLowerCase().includes(search.toLowerCase()) ||
    e.uloga.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(employees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Zaposleni");
    XLSX.writeFile(wb, "IMH_Zaposleni_2026.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zaposleni</h1>
          <p className="text-gray-500">Pregled svih 19 zaposlenika i njihovih statusa.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          {/* Only Admin can add */}
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novi Zaposlenik
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista Zaposlenika</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Pretraži..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Ime i Prezime</TableHead>
                  <TableHead>Kategorija</TableHead>
                  <TableHead>Uloga</TableHead>
                  <TableHead className="text-right">Neto Osnova</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((employee: any) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>{employee.imeIPrezime}</TableCell>
                    <TableCell>
                      <Badge variant={
                        employee.kategorija === 'A' ? 'default' :
                        employee.kategorija === 'B' ? 'secondary' :
                        employee.kategorija === 'C' ? 'outline' : 'destructive'
                      }>
                        {employee.kategorija}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.uloga}</TableCell>
                    <TableCell className="text-right font-mono">
                      {parseFloat(employee.netoOsnova).toLocaleString('bs-BA', { minimumFractionDigits: 2 })} KM
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={employee.aktivan ? 'success' : 'destructive'} className="bg-green-100 text-green-800 hover:bg-green-100">
                        {employee.aktivan ? 'Aktivan' : 'Neaktivan'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
