import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.qualityCheck.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.drawing.deleteMany();
  await prisma.quotation.deleteMany();
  const admin = await prisma.user.upsert({
    where: { email: "admin@erp.local" },
    update: {},
    create: { email: "admin@erp.local", name: "Admin User", role: "ADMIN", isActive: true },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@erp.local" },
    update: {},
    create: { email: "manager@erp.local", name: "Sales Manager", role: "MANAGER", department: "Sales", isActive: true },
  });

  await prisma.user.upsert({
    where: { email: "engineer@erp.local" },
    update: {},
    create: { email: "engineer@erp.local", name: "Senior Engineer", role: "MANAGER", department: "Engineering", isActive: true },
  });

  const lead1 = await prisma.lead.create({
    data: { companyName: "شركة السلام للمقاولات", contactName: "أحمد محمد", contactEmail: "ahmed@alsalam.com", contactPhone: "0555000011", source: "Website", stage: "QUALIFIED", score: 75, estimatedValue: 450000, notes: "مشروع واجهات زجاجية لمبنى إداري", assignedTo: manager.id },
  });

  const lead2 = await prisma.lead.create({
    data: { companyName: "مؤسسة النهضة", contactName: "خالد العلي", contactEmail: "khalid@nahda.com", contactPhone: "0555000022", source: "Referral", stage: "LEAD", score: 45, estimatedValue: 180000, assignedTo: manager.id },
  });

  const lead3 = await prisma.lead.create({
    data: { companyName: "شركة البناء الحديث", contactName: "سارة عبدالله", contactEmail: "sara@binmodern.com", contactPhone: "0555000033", source: "Exhibition", stage: "NEGOTIATION", score: 88, estimatedValue: 920000 },
  });

  await prisma.quotation.create({
    data: { leadId: lead1.id, quoteNumber: "Q-0001", items: [{ description: "واجهة زجاجية 12مم مقسى", quantity: 100, unit: "m²", unitPrice: 350 }, { description: "تركيب واجهات", quantity: 100, unit: "m²", unitPrice: 120 }], subtotal: 47000, total: 54050, taxRate: 15, status: "SENT" },
  });

  const project1 = await prisma.project.create({
    data: { name: "مبنى الإدارة - واجهات زجاجية", description: "تركيب واجهات ستارة زجاجية لمبنى الإدارة المكون من 10 طوابق", leadId: lead1.id, status: "IN_PROGRESS", startDate: new Date("2026-01-15"), endDate: new Date("2026-06-30"), budget: 450000, location: "الرياض - حي الملقا", managerId: manager.id, clientName: "شركة السلام للمقاولات", clientPhone: "0555000011" },
  });

  const project2 = await prisma.project.create({
    data: { name: "فلل سكنية - ألمنيوم و UPVC", description: "نوافذ وأبواب ألمنيوم و UPVC لـ 12 فيلا سكنية", status: "PLANNING", budget: 320000, location: "جدة - حي الشاطئ", clientName: "مؤسسة النهضة" },
  });

  await prisma.task.create({ data: { projectId: project1.id, title: "مسح الموقع وأخذ المقاسات", status: "DONE", priority: "HIGH", assigneeId: manager.id } });
  await prisma.task.create({ data: { projectId: project1.id, title: "تقديم التصاميم الأولية", status: "IN_PROGRESS", priority: "HIGH", assigneeId: manager.id, dueDate: new Date("2026-05-20") } });
  await prisma.task.create({ data: { projectId: project1.id, title: "اعتماد المواد من العميل", status: "PENDING", priority: "MEDIUM", dueDate: new Date("2026-06-01") } });

  await prisma.dailyReport.create({ data: { projectId: project1.id, reportDate: new Date("2026-05-09"), summary: "تم تركيب 20% من واجهات الطابق الأول", weather: "مشمس", submittedBy: manager.id } });

  const supplier1 = await prisma.supplier.create({
    data: { name: "شركة الزجاج السعودي", contactName: "فهد العتيبي", contactEmail: "fahd@sgg.com", contactPhone: "0555111001", category: "Glass", rating: 4 },
  });

  const supplier2 = await prisma.supplier.create({
    data: { name: "مؤسسة الألمنيوم العربي", contactName: "محمد العنزي", contactEmail: "moh@arabal.com", contactPhone: "0555111002", category: "Aluminum", rating: 5 },
  });

  await prisma.purchaseOrder.create({
    data: { poNumber: "PO-0001", supplierId: supplier1.id, projectId: project1.id, items: [{ description: "زجاج مقسى 12مم", quantity: 200, unit: "m²", unitPrice: 185 }], totalAmount: 37000, status: "CONFIRMED", orderDate: new Date("2026-04-01"), expectedDate: new Date("2026-05-15") },
  });

  await prisma.purchaseOrder.create({
    data: { poNumber: "PO-0002", supplierId: supplier2.id, items: [{ description: "بروفيل ألمنيوم 6063", quantity: 500, unit: "m", unitPrice: 45 }], totalAmount: 22500, status: "SENT" },
  });

  await prisma.inventoryItem.create({ data: { sku: "GLM-012", name: "زجاج مقسى 12مم", category: "Glass", unit: "m²", quantity: 50, minQuantity: 20, unitCost: 180 } });
  await prisma.inventoryItem.create({ data: { sku: "AL-6063", name: "بروفيل ألمنيوم 6063", category: "Aluminum", unit: "m", quantity: 200, minQuantity: 100, unitCost: 42 } });
  await prisma.inventoryItem.create({ data: { sku: "UPVC-01", name: "قطاع UPVC أبيض", category: "UPVC", unit: "m", quantity: 0, minQuantity: 50, unitCost: 30 } });

  const prod1 = await prisma.productionOrder.create({
    data: { orderNumber: "MFG-0001", projectId: project1.id, productName: "واجهة زجاجية - الطابق الأول", quantity: 20, priority: "HIGH", status: "IN_PROGRESS", scheduledDate: new Date("2026-05-20"), assignedTo: "فريق التصنيع" },
  });

  const prod2 = await prisma.productionOrder.create({
    data: { orderNumber: "MFG-0002", productName: "نوافذ UPVC - مقاس 1.2x1.5م", quantity: 50, priority: "MEDIUM", status: "PENDING", scheduledDate: new Date("2026-06-01") },
  });

  await prisma.qualityCheck.create({ data: { productionOrderId: prod1.id, stage: "Cutting", passed: true, notes: "الأبعاد مطابقة للمخطط", checkedBy: "مهندس الجودة" } });
  await prisma.qualityCheck.create({ data: { productionOrderId: prod1.id, stage: "Assembly", passed: false, notes: "تحتاج إعادة ضبط الإطار", checkedBy: "مهندس الجودة" } });

  await prisma.expense.create({ data: { projectId: project1.id, category: "Materials", description: "شراء زجاج مقسى - دفعة أولى", amount: 18500 } });
  await prisma.expense.create({ data: { category: "Transport", description: "نقل مواد للموقع", amount: 2500 } });
  await prisma.expense.create({ data: { category: "Labor", description: "أجور عمال التركيب - شهر مايو", amount: 15000 } });

  const todayStr = new Date().toISOString().split("T")[0];
  await prisma.attendance.create({ data: { userId: manager.id, date: new Date(), checkIn: new Date(`${todayStr}T07:30:00`), checkOut: new Date(`${todayStr}T16:00:00`), status: "PRESENT", location: "المكتب الرئيسي" } });

  await prisma.drawing.create({ data: { projectId: project1.id, title: "واجهة شمالية - قطاع رأسي", version: 1, fileUrl: "https://example.com/drawings/north-elevation-v1.pdf", status: "APPROVED", createdBy: manager.id } });

  await prisma.supportTicket.create({ data: { projectId: project1.id, customerName: "أحمد محمد", customerPhone: "0555000011", subject: "تسريب مياه من إطار النافذة", description: "في الطابق الثالث يوجد تسريب مياه خفيف حول إطار النافذة الشمالية", category: "INSTALLATION", priority: "HIGH", status: "OPEN" } });

  await prisma.supportTicket.create({
    data: { customerName: "خالد العلي", customerPhone: "0555000022", subject: "استفسار عن موعد التركيب", description: "نرغب في معرفة موعد بدء تركيب النوافذ للمشروع الجديد", category: "OTHER", priority: "LOW", status: "RESOLVED", resolvedAt: new Date() },
  });

  console.log("✅ Demo data seeded successfully");
  console.log("   Users: admin@erp.local, manager@erp.local, engineer@erp.local");
  console.log("   Leads: 3, Projects: 2, Tasks: 3, Reports: 1");
  console.log("   Suppliers: 2, POs: 2, Inventory: 3");
  console.log("   Production Orders: 2, QC Checks: 2");
  console.log("   Expenses: 3, Attendance: 1, Drawings: 1, Tickets: 2");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
