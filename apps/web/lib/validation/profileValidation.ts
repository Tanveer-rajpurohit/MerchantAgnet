export function validateFullName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Full name is required";
  }
  if (trimmed.length < 2) {
    return "Full name must be at least 2 characters";
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return "Full name contains invalid characters";
  }
  return null;
}

export function validatePhoneNumber(phone: string, required: boolean = true): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return required ? "Phone number is required" : null;
  }

  if (!/^\+?[0-9\s\-()]+$/.test(trimmed)) {
    return "Phone number contains invalid characters";
  }

  const cleaned = trimmed.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("+")) {
    if (!/^\+[1-9]\d{6,14}$/.test(cleaned)) {
      return "Please enter a valid international phone number with country code (e.g. +91 9876543210)";
    }

    if (cleaned.startsWith("+91")) {
      const national = cleaned.slice(3);
      if (!/^[6-9]\d{9}$/.test(national)) {
        return "Indian mobile numbers with +91 must have 10 digits starting with 6, 7, 8, or 9";
      }
    }
    return null;
  }

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    const national = cleaned.slice(2);
    if (!/^[6-9]\d{9}$/.test(national)) {
      return "Please enter a valid 10-digit mobile number";
    }
    return null;
  }

  if (cleaned.startsWith("0") && cleaned.length === 11) {
    const national = cleaned.slice(1);
    if (!/^[6-9]\d{9}$/.test(national)) {
      return "Please enter a valid 10-digit mobile number";
    }
    return null;
  }

  if (cleaned.length === 10) {
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
    }
    return null;
  }

  if (/^\d{7,15}$/.test(cleaned)) {
    return null;
  }

  return "Please enter a valid phone number or include country code (e.g. +91 9876543210)";
}

export function validateStoreName(storeName: string): string | null {
  const trimmed = storeName.trim();
  if (!trimmed) {
    return "Store / Business name is required";
  }
  if (trimmed.length < 2) {
    return "Store name must be at least 2 characters";
  }
  return null;
}

export function validateGstin(gstin: string): string | null {
  const trimmed = gstin.trim().toUpperCase();
  if (!trimmed) return null;

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(trimmed)) {
    return "Invalid GSTIN format (e.g. 27AAAAA0000A1Z5)";
  }
  return null;
}

export function validateUpiId(upiId: string): string | null {
  const trimmed = upiId.trim().toLowerCase();
  if (!trimmed) return null;

  const upiRegex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  if (!upiRegex.test(trimmed)) {
    return "Invalid UPI ID format (e.g. store@okaxis)";
  }
  return null;
}

export function validatePincode(pincode: string): string | null {
  const trimmed = pincode.trim();
  if (!trimmed) return null;

  const pinRegex = /^[1-9][0-9]{5}$/;
  if (!pinRegex.test(trimmed)) {
    return "Please enter a valid 6-digit Indian PIN code";
  }
  return null;
}
