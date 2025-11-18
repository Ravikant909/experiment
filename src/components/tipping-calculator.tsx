"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, Percent, RefreshCw } from 'lucide-react';
import { Separator } from './ui/separator';

const tipPresets = [15, 18, 20, 25];

export function TippingCalculator() {
  const [bill, setBill] = useState('');
  const [people, setPeople] = useState('1');
  const [tipOption, setTipOption] = useState('18');
  const [customTip, setCustomTip] = useState('');

  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBill(e.target.value);
  };

  const handlePeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeople(e.target.value);
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipOption('custom');
    setCustomTip(e.target.value);
  };
  
  const handleTipSelect = (tipValue: string) => {
    setTipOption(tipValue);
  };

  const handleReset = () => {
    setBill('');
    setPeople('1');
    setTipOption('18');
    setCustomTip('');
  };

  const { tipPerPerson, totalPerPerson, totalBillWithTip, totalTip, isValid } = useMemo(() => {
    const billAmount = parseFloat(bill);
    const numPeople = parseInt(people, 10);
    const tipPercentValue = tipOption === 'custom' ? parseFloat(customTip) : parseFloat(tipOption);

    if (isNaN(billAmount) || billAmount <= 0 || isNaN(numPeople) || numPeople <= 0) {
      return { tipPerPerson: 0, totalPerPerson: 0, totalBillWithTip: 0, totalTip: 0, isValid: false };
    }
    
    const tipAmount = billAmount * (tipPercentValue / 100);
    const totalAmount = billAmount + tipAmount;

    return {
      tipPerPerson: tipAmount / numPeople,
      totalPerPerson: totalAmount / numPeople,
      totalBillWithTip: totalAmount,
      totalTip: tipAmount,
      isValid: true,
    };
  }, [bill, people, tipOption, customTip]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  return (
    <Card className="w-full max-w-md shadow-xl transition-all">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-4xl font-bold tracking-tight text-primary">
          SplitzyTip
        </CardTitle>
        <CardDescription>
          Calculate tips and split bills with ease.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="bill" className="font-semibold">Bill Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              id="bill" 
              type="number" 
              placeholder="0.00" 
              value={bill}
              onChange={handleBillChange}
              className="pl-10 text-lg h-12"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Select Tip %</Label>
          <div className="grid grid-cols-3 gap-2">
            {tipPresets.map((tip) => (
              <Button 
                key={tip}
                variant={tipOption === tip.toString() ? 'default' : 'outline'}
                onClick={() => handleTipSelect(tip.toString())}
                className="h-12 text-lg"
              >
                {tip}%
              </Button>
            ))}
             <div className="relative col-span-1">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="number" 
                  placeholder="Custom" 
                  value={customTip}
                  onChange={handleCustomTipChange}
                  onFocus={() => setTipOption('custom')}
                  className="pl-10 h-12 text-lg text-center"
                  min="0"
                />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="people" className="font-semibold">Number of People</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              id="people" 
              type="number" 
              value={people}
              onChange={handlePeopleChange}
              className="pl-10 text-lg h-12"
              min="1"
            />
          </div>
        </div>
      </CardContent>

      <div className={`bg-primary/5 p-6 rounded-b-lg transition-opacity duration-500 ${isValid ? 'opacity-100' : 'opacity-40'}`}>
        <div className="space-y-5">
           <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-primary/80">Tip</p>
              <p className="text-xs text-primary/60">per person</p>
            </div>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(tipPerPerson)}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-primary/80">Total</p>
              <p className="text-xs text-primary/60">per person</p>
            </div>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(totalPerPerson)}
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <p>Total Tip</p>
              <p className="font-semibold">{formatCurrency(totalTip)}</p>
            </div>
            <div className="flex justify-between items-center text-sm">
              <p>Total Bill</p>
              <p className="font-semibold">{formatCurrency(totalBillWithTip)}</p>
            </div>
          </div>
        </div>
        <Button 
          variant="secondary" 
          className="w-full mt-6 h-12 text-base"
          onClick={handleReset}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </Card>
  );
}
