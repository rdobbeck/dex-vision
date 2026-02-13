import { TokenSearch } from "@/components/tokens/token-search";

export default function TokensPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Token Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search for any token across all supported chains
        </p>
      </div>
      <TokenSearch />
    </div>
  );
}
