export type BuyerDetails = {
  name: string;
  email: string;
  phone: string | null;
  companyName: string;
  city: string;
  whatsapp: string;
  gstin: string;
};

export function inquiryEmail(toName: string, productTitle: string | undefined, buyer: BuyerDetails, message: string): string {
  const lines = [
    `You have a new buyer requirement on ApnaMart.`,
    "",
    productTitle ? `Product: ${productTitle}` : "Product: (general requirement)",
    `Buyer: ${buyer.name}`,
    buyer.companyName ? `Company: ${buyer.companyName}` : null,
    buyer.city ? `City: ${buyer.city}` : null,
    `Email: ${buyer.email}`,
    buyer.phone ? `Phone: ${buyer.phone}` : null,
    buyer.whatsapp ? `WhatsApp: ${buyer.whatsapp}` : null,
    buyer.gstin ? `GSTIN: ${buyer.gstin}` : null,
    "",
    "Requirement:",
    message,
    "",
    "Reply directly to the buyer. ApnaMart does not collect payments.",
  ];
  return lines.filter((line) => line !== null).join("\n");
}

export function dealerInbox(seller: { inquiryEmail: string; user: { email: string } }): string {
  const custom = seller.inquiryEmail.trim();
  return custom || seller.user.email;
}

export type PublicContact = {
  contactName: string;
  phone: string | null;
  email: string | null;
  emailInquiriesEnabled: boolean;
  whatsapp: string | null;
};

export function publicContact(seller: {
  inquiryEmail: string;
  emailInquiriesEnabled: boolean;
  showEmailPublicly: boolean;
  whatsappBusiness: string;
  whatsappEnabled: boolean;
  user: { name: string; phone: string | null; email: string };
}): PublicContact {
  const inbox = dealerInbox(seller);
  return {
    contactName: seller.user.name,
    phone: seller.user.phone,
    email: seller.showEmailPublicly ? inbox : null,
    emailInquiriesEnabled: seller.emailInquiriesEnabled,
    whatsapp: seller.whatsappEnabled && seller.whatsappBusiness.trim() ? seller.whatsappBusiness.trim() : null,
  };
}
