# SmartShelfX – AI-Based Inventory Forecast & Auto-Restock

## Project Overview
SmartShelfX is a next-generation inventory management platform designed to optimize stock levels using AI-powered demand forecasting. It bridges the gap between traditional inventory tracking and modern predictive analytics, allowing businesses to prevent stockouts and overstocking automatically.

## Features Implemented (Top to Bottom)

### 1. User & Role Management (Security Layer)
*   **Feature:** Role-based Login (Admin, Warehouse Manager, Vendor).
*   **Update:** Added a **Profile Page** where users can edit personal details (Phone, Bio) and view their specific system permissions and restrictions.
*   **Workflow:** Users authenticate via email/role. The app restricts access to specific routes based on these roles (e.g., Vendors cannot edit stock).

### 2. Dashboard (Analytics Layer)
*   **Feature:** Real-time visualization of key metrics.
*   **Details:** Displays total inventory value, low stock alerts, and recent transactions.
*   **Visuals:** Includes a Pie Chart for category distribution and a Bar Chart for Stock vs. Reorder Levels.

### 3. Inventory Catalog (Core Data Layer)
*   **Feature:** CRUD operations for products.
*   **Update:** Added **Batch CSV Import**. Users can now upload a CSV file to bulk-add products instead of entering them one by one.
*   **Details:** Tracks SKU, Vendor, Price, and Stock Levels. Includes visual indicators for low stock.

### 4. Stock Transactions (Operational Layer)
*   **Feature:** Record inbound (Stock In) and outbound (Stock Out) movements.
*   **Logic:** Prevents "Stock Out" if quantity exceeds current availability. Logs the handler's name and timestamp for audit trails.

### 5. AI Demand Forecasting (Predictive Layer)
*   **Feature:** 7-Day Sales Prediction.
*   **AI Integration:** Uses **Google Gemini 2.5 Flash** to analyze current stock context and seasonal trends.
*   **Output:** Returns a confidence score and a "Risk Level" (High/Medium/Low) indicating if demand will likely outstrip supply.

### 6. Auto-Restock & Order Management (Procurement Layer)
*   **Feature:** AI-driven purchase suggestions.
*   **Update:** Implemented a full **Purchase Order (PO) System**.
    *   **Step 1:** AI analyzes stock and suggests reorder quantities.
    *   **Step 2:** User clicks "Generate PO".
    *   **Step 3:** Order moves to the **Orders Page**.
    *   **Step 4:** Vendors approve/ship orders; Admins receive them.
    *   **Step 5:** When marked "Delivered", stock is **automatically incremented** in the inventory.

### 7. AI Smart Assistant (Interactive Layer)
*   **Feature:** Floating Chat Widget.
*   **Update:** Added a context-aware **Chatbot**.
*   **Workflow:** Users can ask natural language questions like "What is my total inventory value?" or "Draft an email to TechSolutions about missing items." The AI reads the current state and provides instant answers.

---

## Workflow Overview

1.  **Login:** Admin logs in to view the dashboard.
2.  **Monitor:** Dashboard highlights "Low Stock Alerts".
3.  **Analyze:** Admin visits "AI Forecast" to see demand predictions.
4.  **Act:** Admin goes to "Auto Restock", lets AI calculate needs, and generates Purchase Orders.
5.  **Vendor Action:** Vendor logs in, sees the PO, and marks it as "Shipped".
6.  **Receive:** Admin marks PO as "Delivered" -> Inventory updates automatically.
7.  **Support:** At any time, the user asks the AI Chat Widget for specific data points.

---

## Technology Stack & Rationale

| Tool | Usage | Why? |
| :--- | :--- | :--- |
| **React 19** | Frontend Framework | Component-based architecture allows for reusable UI elements (Cards, Modals, Tables) and efficient state updates. |
| **TypeScript** | Language | Type safety ensures data integrity (e.g., ensuring a Product always has an SKU and Price) reducing runtime errors. |
| **Tailwind CSS** | Styling | Utility-first CSS allows for rapid UI development, responsive design, and consistent theming (Indigo/Slate palette). |
| **Context API** | State Management | Native React solution perfect for this scale. Manages global state for Users, Products, Transactions, and Notifications without external bloat (Redux). |
| **Google GenAI SDK** | Artificial Intelligence | Powered by the `gemini-2.5-flash` model. It offers low latency and high capability for analyzing JSON data structures and returning structured predictions. |
| **Recharts** | Data Visualization | Built specifically for React. Declarative syntax makes rendering complex Pie/Bar charts simple and responsive. |
| **Lucide React** | Iconography | Lightweight, consistent SVG icons that enhance UI UX/readability. |
| **React Router** | Navigation | Handles SPA routing, protected routes (guards), and history management. |

