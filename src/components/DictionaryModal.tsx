import { useState } from 'react';
import { ChevronLeft, ChevronRight, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Company } from '@/types/company';
import { cn } from '@/lib/utils';

interface DictionaryModalProps {
  companies: Company[];
  isOpen: boolean;
  onClose: () => void;
}

export const DictionaryModal = ({ companies, isOpen, onClose }: DictionaryModalProps) => {
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);

  if (!isOpen) return null;

  const companiesWithDictionary = companies.filter(c => c.dictionaryEntries && c.dictionaryEntries.length > 0);
  
  if (companiesWithDictionary.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 animate-in slide-in-from-bottom">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              <h3 className="text-lg font-semibold">All Companies Dictionary</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
          <div className="text-center text-muted-foreground py-8">
            No dictionary entries found across companies
          </div>
        </div>
      </div>
    );
  }

  const currentCompany = companiesWithDictionary[currentCompanyIndex];

  const goToPrevious = () => {
    setCurrentCompanyIndex((prev) => 
      prev === 0 ? companiesWithDictionary.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentCompanyIndex((prev) => 
      prev === companiesWithDictionary.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 animate-in slide-in-from-bottom">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <h3 className="text-lg font-semibold">All Companies Dictionary</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={companiesWithDictionary.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{currentCompany.name}</span>
                <span className="text-sm text-muted-foreground font-normal">
                  {currentCompanyIndex + 1} / {companiesWithDictionary.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {currentCompany.dictionaryEntries?.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="font-semibold text-sm mb-1">{entry.word}</div>
                    <div className="text-xs text-muted-foreground">{entry.definition}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={companiesWithDictionary.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {companiesWithDictionary.map((company, index) => (
            <button
              key={company.id}
              onClick={() => setCurrentCompanyIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentCompanyIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`View ${company.name} dictionary`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};