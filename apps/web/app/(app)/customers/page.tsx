"use client";

import { useState } from "react";
import {
  ContactList,
  AddCustomerModal,
  CUSTOMERS,
} from "../../components/app/customers";

export default function CustomersPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-10">
        <ContactList
          customers={CUSTOMERS}
          onAddCustomer={() => setShowAddModal(true)}
        />
      </div>

      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
