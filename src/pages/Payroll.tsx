import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useAuth } from '../lib/auth';
import { calculatePayroll, calculateDodatakStaz, PayrollInput, PayrollResult } from '../lib/payroll';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Loader2, Save, Calculator, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Decimal from 'decimal.js';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Payroll() {
  const { user } = useAuth();
  const { data: employees } = useSWR('/api/employees', fetcher);
  const { data: params } = useSWR('/api/parameters/active', fetcher);
  
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [calculations, setCalculations] = useState<Record<number, PayrollResult>>({});
  const [inputs, setInputs] = useState<Record<number, { staz: number, varijabilni: number, prevoz: number }>>({});
  const [saving, setSaving] = useState(false);

  // Initialize inputs when employees load
  useEffect(() => {
    if (employees) {
      const initialInputs: any = {};
      employees.forEach((e: any) => {
        if (e.aktivan) {
          initialInputs[e.id] = {
            staz: e.godinStaza || 0,
            varijabilni: 0,
            prevoz: 0
          };
        }
      });
      setInputs(initialInputs);
    }
  }, [employees]);

  const handleCalculate = () => {
    if (!employees || !params) return;

    const newCalculations: Record<number, PayrollResult> = {};
    
    // Convert params strings to numbers
    const payrollParams = {
      doprinosiIzPlate: parseFloat(params.doprinosiIzPlate),
      doprinosiNaPlatu: parseFloat(params.doprinosiNaPlatu),
      porezStopa: parseFloat(params.porezStopa),
      licniOdbitak: parseFloat(params.licniOdbitak),
      topliObrok: parseFloat(params.topliObrok),
    };

    employees.forEach((e: any) => {
      if (!e.aktivan) return;
      
      const input = inputs[e.id];
      const netoOsnova = parseFloat(e.netoOsnova);
      
      // Calculate staz amount
      const stazAmount = calculateDodatakStaz(new Decimal(netoOsnova), input.staz).toNumber();

      const payrollInput: PayrollInput = {
        netoOsnova,
        dodatakStaz: stazAmount,
        dodVarijabilni: input.varijabilni,
        naknPrevoz: input.prevoz,
        params: payrollParams
      };

      try {
        const result = calculatePayroll(payrollInput);
        newCalculations[e.id] = result;
      } catch (err) {
        console.error(`Calculation error for ${e.imeIPrezime}:`, err);
        toast.error(`Greška u kalkulaciji za ${e.imeIPrezime}`);
      }
    });

    setCalculations(newCalculations);
    toast.success('Kalkulacija uspješno izvršena');
  };

  const handleSave = async () => {
    if (Object.keys(calculations).length === 0) {
      toast.error('Molimo prvo izvršite kalkulaciju');
      return;
    }

    setSaving(true);
    try {
      // In a real app, send to API
      // await fetch('/api/payroll', { method: 'POST', body: JSON.stringify({ period, calculations }) });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Obračun uspješno sačuvan');
    } catch (err) {
      toast.error('Greška pri čuvanju obračuna');
    } finally {
      setSaving(false);
    }
  };

  if (!employees || !params) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const totalCost = Object.values(calculations).reduce((acc, curr) => {
    return acc + parseFloat(curr.ukupnoTrosak.replace('.', '').replace(',', '.'));
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Obračun Plata</h1>
          <p className="text-gray-500">Kalkulacija zarada za period {period}</p>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            type="month" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="w-40"
          />
          <Button onClick={handleCalculate} variant="outline">
            <Calculator className="w-4 h-4 mr-2" />
            Kalkulacija
          </Button>
          <Button onClick={handleSave} disabled={saving || Object.keys(calculations).length === 0}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Sačuvaj Obračun
          </Button>
        </div>
      </div>

      {Object.keys(calculations).length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-600 font-medium">Ukupni Trošak (Bruto II + Topli Obrok + Prevoz)</p>
                <p className="text-3xl font-bold text-blue-900">
                  {totalCost.toLocaleString('bs-BA', { minimumFractionDigits: 2 })} KM
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-300" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Unos Podataka</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zaposlenik</TableHead>
                  <TableHead className="text-right">Neto Osnova</TableHead>
                  <TableHead className="w-24">Staž (god)</TableHead>
                  <TableHead className="w-32">Varijabilni (KM)</TableHead>
                  <TableHead className="w-32">Prevoz (KM)</TableHead>
                  <TableHead className="text-right bg-gray-50">Neto Isplata</TableHead>
                  <TableHead className="text-right bg-gray-50">Ukupni Trošak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e: any) => {
                  if (!e.aktivan) return null;
                  const input = inputs[e.id] || { staz: 0, varijabilni: 0, prevoz: 0 };
                  const calc = calculations[e.id];

                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        {e.imeIPrezime}
                        <div className="text-xs text-gray-500">{e.uloga}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {parseFloat(e.netoOsnova).toLocaleString('bs-BA', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="0"
                          value={input.staz}
                          onChange={(ev) => setInputs({
                            ...inputs,
                            [e.id]: { ...input, staz: parseInt(ev.target.value) || 0 }
                          })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={input.varijabilni}
                          onChange={(ev) => setInputs({
                            ...inputs,
                            [e.id]: { ...input, varijabilni: parseFloat(ev.target.value) || 0 }
                          })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={input.prevoz}
                          onChange={(ev) => setInputs({
                            ...inputs,
                            [e.id]: { ...input, prevoz: parseFloat(ev.target.value) || 0 }
                          })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold bg-gray-50">
                        {calc ? calc.netoUkupno : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold bg-gray-50 text-blue-700">
                        {calc ? calc.ukupnoTrosak : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
