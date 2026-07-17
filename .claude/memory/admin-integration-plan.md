---
name: admin-integration-plan
description: Blueprint for connecting admin panel components to backend services
metadata:
  type: project
---

**Project Overview**  
This memory documents the integration blueprint for connecting the admin dashboard components to backend services. It captures the current mock integration points and outlines how they will connect to real APIs when available.

**Current Structure**  
- Admin panel routes under `app/(admin)/admin/*`  
- Core components: StockEditorForm, StocksList, StockRequestsList  
- Contexts: PortfolioContext, CopyTradingContext, StockRequestContext  
- API stubs created in `lib/api/stocks.ts` and `lib/api/orders.ts`  

**Missing Connections Identified**  
1. **Form Submission** - StockEditorForm needs actual API endpoint for creating stocks  
2. **Order Management** - Approval/rejection of orders requires backend integration  
3. **State Synchronization** - PortfolioContext must update when orders are processed  
4. **UI Feedback** - Success/error messages need real response handling  

**Next Steps**  
- Implement real backend endpoints in `lib/api`  
- Add validation and error handling  
- Create proper data persistence between contexts  
- Build UI components for order approval workflow  

**Why**  
These integrations will enable full admin control over stock management, user orders, and marketplace operations, making the dashboard functional end-to-end.

**How to Apply**  
- Developers can reference this plan when implementing new API endpoints  
- QA can verify that integration points are properly mocked before real backend exists  
- Architects can use this as documentation for service boundaries  

**Reference Memories**  
[[admin-integration-plan]]