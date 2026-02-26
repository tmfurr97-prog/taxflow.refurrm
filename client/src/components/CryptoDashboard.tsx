import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CryptoExchangeConnector } from './CryptoExchangeConnector';
import { CryptoTransactionImporter } from './CryptoTransactionImporter';
import { CryptoPortfolio } from './CryptoPortfolio';
import { CryptoGainsCalculator } from './CryptoGainsCalculator';
import { CryptoForm8949 } from './CryptoForm8949';
import { CryptoTaxLossHarvesting } from './CryptoTaxLossHarvesting';
import { CryptoMinerDeductions } from './CryptoMinerDeductions';
import { Bitcoin } from 'lucide-react';

export function CryptoDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bitcoin className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold">Cryptocurrency Tax Tracking</h1>
          <p className="text-muted-foreground">
            Import transactions, calculate gains, and generate tax forms
          </p>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="gains">Gains</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="harvesting">Tax Loss</TabsTrigger>
          <TabsTrigger value="mining">Mining</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <CryptoPortfolio key={refreshKey} />
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <CryptoExchangeConnector onConnected={() => setRefreshKey(prev => prev + 1)} />
          <CryptoTransactionImporter />
        </TabsContent>

        <TabsContent value="gains">
          <CryptoGainsCalculator />
        </TabsContent>

        <TabsContent value="forms">
          <CryptoForm8949 />
        </TabsContent>

        <TabsContent value="harvesting">
          <CryptoTaxLossHarvesting />
        </TabsContent>

        <TabsContent value="mining">
          <CryptoMinerDeductions />
        </TabsContent>
      </Tabs>
    </div>
  );
}