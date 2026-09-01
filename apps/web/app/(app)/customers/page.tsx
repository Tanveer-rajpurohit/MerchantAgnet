"use client";

import { useState, useEffect } from "react";
import {
  useCustomerConnections,
  useAcceptCustomerConnection,
} from "../../../hooks/useCustomerConnections";
import { useSocketStore } from "../../../stores/useSocketStore";
import { ContactList } from "../../components/app/customers";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    useSocketStore.getState().disconnect();
  }, []);

  const {
    customers,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreCustomers,
  } = useCustomerConnections({
    status: statusFilter,
    search,
  });

  const acceptMutation = useAcceptCustomerConnection();

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-10">
        <ContactList
          customers={customers}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreCustomers}
          onAccept={(id) => acceptMutation.mutate(id)}
          acceptingId={acceptMutation.isPending ? (acceptMutation.variables as string) : null}
        />
      </div>
    </div>
  );
}
