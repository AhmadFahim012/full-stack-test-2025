# **Full-Stack Developer Test – Turing Test**

This test is a part of our hiring process at TuringTech for [fullstack positions](https://turingtechnologies.org/careers). It should take you between 5-6 hours depending on your experience.

Hope you will have as much fun as we did coding this test!

## **Objective**

Build a simplified ChatGPT-like application with a **Next.js frontend** and a **backend of your choice** (**NestJS preferred**).

The goal of this test is to evaluate your ability to design and implement:

- **Frontend state management** (handling chat sessions, loading states, UI updates)
- **Backend architecture** (API design, async request handling, secure communication)
- **Database design** (chat persistence, user ownership of data)
- **Authentication integration** (either Supabase or custom)

---

### **1. Authentication (Supabase Preferred)**

- **Option 1 – Supabase Auth (Preferred):**

  - Email/password registration & login
  - Google login (OAuth)
  - Protect all chat-related pages
  - Integrate Supabase session into frontend and backend authorization

- **Option 2 – Custom Auth:**

  - Implement your own authentication system (JWT, sessions, password hashing, etc.)
  - Protect chat-related pages and API routes
  - Document your authentication approach

---

### **2. Frontend (Next.js App)**

- **Framework:** **Next.js (mandatory)**

- **Preferred configuration:** App Router, TypeScript, TailwindCSS v4, ShadCN UI

- **Pages / Screens to implement (must follow provided Figma designs):**

  1. Login
  2. Signup
  3. Main chat screen with sidebar (chat history shown in sidebar)
  4. Chat details screen (conversation view)

- **Requirements:**

  - Follow the Figma designs exactly:
    [Figma – UI Screens](https://www.figma.com/design/nCJlqmFsnupB4yVeW2dtuS/Turing-Tech-Test?node-id=1-2&t=Fa8KJAfH1zGxYfaY-1)
  - Display chat history in the sidebar for the logged-in user
  - **All chat messages must be sent to and retrieved from the backend.**

    - Candidates must **not hardcode mock responses in the frontend**.
    - The backend (with simulated delay) should be the single source of truth for chat replies.

  - Handle **long-running LLM responses (10–20 sec)** gracefully
  - Proper state management (React Context, React Query, Zustand, etc.)
  - Persist session across refreshes

---

### **3. Backend**

- **Framework:** Candidate may use any backend framework (**NestJS preferred**)

- **Authentication:** Supabase token verification preferred (custom auth allowed if implemented correctly)

- **Responsibilities:**

  - Handle chat and message storage for each user
  - Ensure users can only access their own chats and messages
  - Provide APIs for sending user messages and receiving simulated LLM replies

- **LLM Integration Simulation (Important):**
  In a real system, the backend would call an **external LLM service** (e.g., OpenAI API) using an endpoint like `LLM_API_URL`.
  For this test, you **do not have an actual LLM service**. Instead, you must **simulate the integration inside your backend service layer**.

  **What this means in practice:**

  1. **Service abstraction:**

     - Implement an `LLMService` (or equivalent) that _pretends_ to call an LLM endpoint.
     - Structure it as if you were making a real HTTP request (e.g., using Axios/HttpService, passing tokens/headers, handling timeouts).

  2. **Simulated response:**

     - Introduce a **random delay of 10–20 seconds** before sending back a response.
     - The **response content can be hardcoded**, but should be **longer, multi-sentence text** to demonstrate how the frontend handles delayed output.

     Example response:

     ```json
     {
       "message": "Here is a multi-sentence simulated AI reply. Imagine this came from a real LLM service..."
     }
     ```

  3. **Async handling:**

     - Ensure this delay does **not block other requests**.

  4. **No frontend mocking:**

     - All AI responses must come **via backend simulation**.
     - Do **not hardcode bot replies in the frontend**.

---

### **4. Database**

- If using **Supabase for authentication**, it is preferred that you also use Supabase for storing users, chats, and messages.
- If not using Supabase, **MongoDB is preferred**. Other databases are acceptable if justified.
- You are expected to design a **clean, well-structured schema** that satisfies the requirements of:

  - Storing users and their chats
  - Persisting messages within chats
  - Enforcing ownership (users can only access their own chats/messages)

---

### **5. Frontend-Backend Interaction**

- Frontend calls backend APIs for chat creation, fetching chat lists, and sending messages
- Must handle **long-running responses gracefully**:

  - Prevent duplicate sends
  - Allow navigating other pages while waiting

---

### **6. Optional / Bonus**

- Streaming responses (progressive display)
- Edit/delete messages
- Search/filter chats
- Retry logic for failed LLM calls

---

## **Deliverables**

1. **Code Repositories**

   - Push your code to your own **public GitHub/GitLab repositories**
   - **Frontend and backend must be in separate repos** (if applicable)
   - Create a **merge request (MR)** in each repo
   - Share the **repo links and MR links** with us for review
   - Each repo must include a **README** with setup instructions and an `.env.example` file

2. **Video Walkthrough (Mandatory)**

   - Record a **Loom video** walking through your implementation
   - Cover:

     - Authentication approach (Supabase or custom)
     - State management strategy
     - LLM integration & async handling
     - Handling of long-running responses
     - Code structure & trade-offs

   - Show the app running and demonstrate its functionality

3. **Deployment (Preferred, not required)**

   - Deploy the frontend (e.g., Vercel)
   - Deploy the backend (e.g., AWS, Render, Railway, etc.)
   - Share live demo links if deployed

---

### **Key Notes**

- **Simulate LLM delay:** backend must introduce a **random 10–20s delay** before sending the bot reply
- Backend must **not block other requests** while waiting
- Streaming/progressive response handling is encouraged
- All API endpoints must be **authenticated and secure**

---

## Code Submit
Please organize, design, test and document your code as if it were going into production. Fork this repository and send us link to your repository. We will review it and get back to you in order to talk about your code!

__Feel free to apply! Drop us a line with your Linkedin/Github/AnySocialProfileWhereYouAreActive at hr@turingtechnologies.org__

All the best and happy coding.
