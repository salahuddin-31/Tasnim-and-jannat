"""
Tasnim and Jannat Knit (Tasnim & Jannat Knit) - Hosiery Ledger Management
A high-performance Streamlit core dashboard using gspread to integrate with Google Sheets as the permanent database.

-----------------------------------------------------------------------------------------
গুগল শিট জিস্প্রেড (gspread) এপিআই কী সেটআপ গাইড (Google Sheets Setup instructions):
-----------------------------------------------------------------------------------------
১. Google Cloud Console (https://console.cloud.google.com/) এ যান এবং একটি প্রজেক্ট তৈরি করুন।
২. "Google Sheets API" এবং "Google Drive API" সার্চ বক্সে বের করে 'Enable' করুন।
৩. "IAM & Admin > Service Accounts" এ গিয়ে একটি সার্ভিস অ্যাকাউন্ট বানিয়ে ক্রিয়েট বাটনে ক্লিক করুন।
৪. সার্ভিস অ্যাকাউন্টের সেটিংসে ক্লিক করে "Keys > Add Key > Create New Key > JSON" অপশন সিলেক্ট করুন। 
৫. একটি '.json' ফাইল ডাউনলোড হবে (উদাঃ 'credentials.json')। এই ফাইলটি আপনার পাইথন কোডের সমমানের ফোল্ডারে রাখুন বা এই স্ক্রিপ্টের key ডিকশনারিতে বসান।
৬. স্প্রেডশিটে শেয়ার (Share) বাটনে ক্লিক করে সার্ভিস অ্যাকাউন্টের ক্লায়েন্ট ইমেইলটিকে ('client_email') 'Editor' হিসেবে যোগ করুন।

প্রয়োজনীয় প্যাকেজ ইনস্টল করতে টার্মিনালে রান করুন:
pip install streamlit gspread oauth2client pandas

রান করার কমান্ড:
streamlit run tasnim_jannat_knitt_streamlit.py
"""

import streamlit as st
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd
from datetime import datetime
import hashlib

# Page Settings
st.set_page_config(
    page_title="Tasnim & Jannat Knit Ledger Portal",
    page_icon="🏭",
    layout="wide",
)

# Title and styles
st.markdown("""
    <style>
    .big-font { font-size:28px !important; font-weight: bold; color: #047857; text-align: center; }
    .sub-font { font-size:14px !important; text-align: center; color: #6b7280; font-weight: 500; margin-bottom: 20px;}
    .stat-card { background-color: #f8fafc; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0; text-align: center; }
    .stat-title { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; }
    .stat-val { font-size: 24px; font-weight: bold; color: #047857; margin-top: 5px; }
    </style>
""", unsafe_style_html=True)

st.markdown('<p class="big-font">মেসার্স তাসনিম অ্যান্ড জান্নাত নিট</p>', unsafe_style_html=True)
st.markdown('<p class="sub-font">Tasnim & Jannat Knit - Factory Hosiery & Ledger Accounting System</p>', unsafe_style_html=True)

# ----------------------------------------------------
# 1. Google Sheets Connection Setting
# ----------------------------------------------------
# Replace with your actual spreadsheet ID or set in streamlit secrets
SPREADSHEET_ID = "YOUR_GOOGLE_SPREADSHEET_ID_HERE"

@st.cache_resource
def get_gspread_client():
    # If using local file 'credentials.json' for authentication
    try:
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        # using Streamlit Secrets or local file fallback
        if "gcp_service_account" in st.secrets:
            creds = ServiceAccountCredentials.from_json_keyfile_dict(st.secrets["gcp_service_account"], scope)
        else:
            creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
        client = gspread.authorize(creds)
        return client
    except Exception as e:
        return None

# Ensure spreadsheets database worksheets exist
def ensure_worksheets(spreadsheet):
    ensure_list = [
        {"name": "Users", "headers": ["userId", "email", "passwordHash", "name", "createdAt"]},
        {"name": "Clients", "headers": ["clientId", "name", "contact", "notes", "createdAt"]},
        {"name": "Ledger", "headers": ["entryId", "clientId", "clientName", "date", "description", "plyPage", "productWeight", "productRate", "totalAmount", "receivedAmount", "createdAt", "createdBy"]}
    ]
    
    existing_sheets = [s.title for s in spreadsheet.worksheets()]
    
    for sh in ensure_list:
        if sh["name"] not in existing_sheets:
            new_sh = spreadsheet.add_worksheet(title=sh["name"], rows="100", cols="20")
            new_sh.append_row(sh["headers"])
            st.info(f"স্বয়ংক্রিয়ভাবে গুগল শিটে '{sh['name']}' ট্যাব এবং হেডার তৈরি করা হয়েছে!")

# Secure sha256 password hashes helper
def hash_password(password):
    return hashlib.sha256((password + "_tasnimjannat_streamlit_salt").encode()).hexdigest()

# ----------------------------------------------------
# Database Operation Helpers
# ----------------------------------------------------
client = get_gspread_client()
db_connected = False
sheet_instance = None

if client:
    try:
        if SPREADSHEET_ID != "YOUR_GOOGLE_SPREADSHEET_ID_HERE" and SPREADSHEET_ID:
            sheet_instance = client.open_by_key(SPREADSHEET_ID)
            ensure_worksheets(sheet_instance)
            db_connected = True
    except Exception as err:
        db_connected = False
else:
    db_connected = False

# Fallback UI if not connected
if not db_connected:
    st.sidebar.warning("⚠️ গুগল স্প্রেডশিট সংযোজিত নেই! ক্রেডেনশিয়াল ফাইলে সমস্যা অথবা Spreadsheet ID সংযুক্ত করতে হবে।")
    st.sidebar.markdown("""
    **দ্রুত লোকাল চালুর নিয়ম:**
    ১. সমমানের ডিরেক্টরিতে `credentials.json` ফাইল রাখুন।
    ২. কোডের ৫৮ নাম্বার லைনে আপনার গুগল স্প্রেডশিটের আসল আইডি বসান।
    """)

# ----------------------------------------------------
# SESSION STATE MANAGEMENT
# ----------------------------------------------------
if "user" not in st.session_state:
    st.session_state["user"] = None

# AUTHENTICATION CONTAINER
if st.session_state["user"] is None:
    st.markdown("<h3 style='text-align:center;'>🔐 ম্যানেজার ও ফ্যাক্টরি লগইন</h3>", unsafe_style_html=True)
    
    tab_login, tab_signup = st.tabs(["লগইন (Login)", "নতুন অ্যাকাউন্ট তৈরি (Sign Up)"])
    
    with tab_login:
        with st.form("login_form"):
            login_email = st.text_input("ম্যানেজার ইউজার ইমেইল (Email Address)")
            login_password = st.text_input("পাসওয়ার্ড (Password)", type="password")
            submitted = st.form_submit_button("নিরাপদ লগইন নিশ্চিত করুন")
            
            if submitted:
                if not login_email or not login_password:
                    st.error("ইমেইল এবং পাসওয়ার্ড আবশ্যক!")
                elif not db_connected:
                    # Fallback for offline testing
                    if login_email == "demo@factory.com" and login_password == "demo123":
                        st.session_state["user"] = {"userId": "demo-admin", "name": "সালাহউদ্দিন (অফিস) - ডেমো", "email": login_email}
                        st.rerun()
                    else:
                        st.error("গুগল ডাটাবেজ অফলাইন। ডেমো সেশনে লগইন করতে ইউজার 'demo@factory.com' এবং পাসওয়ার্ড 'demo123' ব্যবহার করুন!")
                else:
                    users_sheet = sheet_instance.worksheet("Users")
                    all_users = users_sheet.get_all_records()
                    user_match = None
                    for u in all_users:
                        if u["email"].lower() == login_email.strip().lower():
                            user_match = u
                            break
                    
                    if user_match and user_match["passwordHash"] == hash_password(login_password):
                        st.session_state["user"] = {"userId": user_match["userId"], "name": user_match["name"], "email": user_match["email"]}
                        st.success("স্বাগতম! আপনি সফলভাবে লগইন হয়েছেন।")
                        st.rerun()
                    else:
                        st.error("ভুল ইমেইল বা পাসওয়ার্ড! যাঁচাই করে আবার চেষ্টা করুন।")
                        
    with tab_signup:
        with st.form("signup_form"):
            signup_name = st.text_input("ম্যানেজারের নাম (Manager Name)")
            signup_email = st.text_input("ইউজার ইমেইল ঠিকানা (Email Address)")
            signup_password = st.text_input("নতুন পাসওয়ার্ড সেট করুন", type="password")
            signup_submit = st.form_submit_button("রেজিস্ট্রেশন করুন")
            
            if signup_submit:
                if not signup_name or not signup_email or not signup_password:
                    st.error("সমস্ত তথ্য পূরণ করা আবশ্যক!")
                elif not db_connected:
                    st.error("দুঃখিত, গুগল ক্লাউড ডাটাবেজ অফলাইন থাকার কারণে অফলাইন নিউ রেজিস্ট্রেশন সম্ভব নয়!")
                else:
                    users_sheet = sheet_instance.worksheet("Users")
                    all_users = users_sheet.get_all_records()
                    exists = any(u["email"].lower() == signup_email.strip().lower() for u in all_users)
                    
                    if exists:
                        st.error("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে!")
                    else:
                        new_id = f"user-{datetime.now().strftime('%M%S')}"
                        hashed_pass = hash_password(signup_password)
                        created_date = datetime.now().isoformat()
                        
                        users_sheet.append_row([new_id, signup_email.strip().lower(), hashed_pass, signup_name, created_date])
                        st.success("অভিনন্দন! অ্যাকাউন্ট তৈরি হয়েছে। পাশে থাকা 'লগইন' অপশন দিয়ে প্রস্থান করুন।")

else:
    # ----------------------------------------------------
    # WORKSPACE DASHBOARD (AUTHENTICATED)
    # ----------------------------------------------------
    current_user = st.session_state["user"]
    
    # Sidebar control panel
    st.sidebar.markdown(f"### 👤 ম্যানেজারঃ **{current_user['name']}**")
    if st.sidebar.button("লগ আউট (Sign Out)", usage="primary"):
        st.session_state["user"] = None
        st.rerun()
        
    st.sidebar.markdown("---")
    
    # Load and cache datas from Google Sheet or load mockup local dummy datasets if offline
    @st.cache_data(ttl=5)
    def load_clients_and_ledger(db_connected):
        if db_connected:
            try:
                clients_w = sheet_instance.worksheet("Clients").get_all_records()
                ledger_w = sheet_instance.worksheet("Ledger").get_all_records()
                return sorted(clients_w, key=lambda x: x["name"]), ledger_w
            except Exception as e:
                return [], []
        else:
            # Fallback local mock dictionaries
            mock_clients = [
                {"clientId": "c1", "name": "ডাব্লিউ রহমান এন্টারপ্রাইজ", "contact": "01711223344", "notes": "নারায়ণগঞ্জ হোসিয়ারি", "createdAt": "2026"},
                {"clientId": "c2", "name": "মেসার্স সুতি কিট ইন্ড্রাস্ট্রি", "contact": "01999887766", "notes": "গাবতলী রোড ফ্যাক্টরি", "createdAt": "2026"}
            ]
            mock_ledger = [
                {"entryId": "e1", "clientId": "c1", "clientName": "ডাব্লিউ রহমান এন্টারপ্রাইজ", "date": "2026-06-01", "description": "সুতি সিঙ্গেল সুতা নিটিং ১০ ফালি", "plyPage": "১০ ফালি", "productWeight": 120.0, "productRate": 35.0, "totalAmount": 4200.0, "receivedAmount": 2000.0, "createdAt": "2026", "createdBy": "সালাহউদ্দিন"},
                {"entryId": "e2", "clientId": "c1", "clientName": "ডাব্লিউ রহমান এন্টারপ্রাইজ", "date": "2026-06-03", "description": "কটন মিক্সি নিটিং ৫ পৃষ্ঠা", "plyPage": "পৃষ্ঠা ৫", "productWeight": 95.5, "productRate": 40.0, "totalAmount": 3820.0, "receivedAmount": 3820.0, "createdAt": "2026", "createdBy": "সালাহউদ্দিন"}
            ]
            return mock_clients, mock_ledger

    clients_list, ledger_entries = load_clients_and_ledger(db_connected)
    
    # ----------------------------------------------------
    # CLIENT MANAGEMENT (ক্লায়েন্ট রেজিস্ট্রি)
    # ----------------------------------------------------
    st.sidebar.subheader("➕ নতুন ক্লায়েন্ট যুক্ত করুন")
    with st.sidebar.form("new_client_form", clear_on_submit=True):
        client_name = st.text_input("ক্লায়েন্টের নাম* (উদাঃ মেসার্স জলিল টেক্সটাইল)")
        client_phone = st.text_input("মোবাইল নম্বার (Contact details)")
        client_notes = st.text_input("ঠিকানা ও মন্তব্য (Address/Notes)")
        client_submit = st.form_submit_button("ক্লায়েন্ট যুক্ত করুন")
        
        if client_submit:
            if not client_name:
                st.error("ক্লায়েন্ট নাম লিখতে হবে!")
            elif db_connected:
                client_sh = sheet_instance.worksheet("Clients")
                new_cid = f"client-{datetime.now().strftime('%H%M%S')}"
                client_sh.append_row([new_cid, client_name.strip(), client_phone.strip(), client_notes.strip(), datetime.now().isoformat()])
                st.success("ক্লায়েন্ট যোগ সফল!")
                load_clients_and_ledger.clear()
                st.rerun()
            else:
                st.error("গুগল ড্রাইভ কানেকশন অনুপস্থিত!")

    # CLIENT SELECTOR / DROP-DOWN SWITCH
    st.sidebar.subheader("📂 ক্লায়েন্ট নির্বাচন করুন")
    if len(clients_list) > 0:
        client_options = {c["clientId"]: f"💼 {c['name']} - {c.get('contact', '')}" for c in clients_list}
        selected_client_id = st.sidebar.selectbox(
            "সিলেক্ট খাতাঃ",
            options=clients_list,
            format_func=lambda x: f"💼 {x['name']} ({x.get('contact', 'যোগাযোগ নেই')})"
        )
        active_client_dict = selected_client_id
        active_client_id = active_client_dict["clientId"]
    else:
        active_client_dict = None
        st.sidebar.warning("কোনো সক্রিয় ক্লায়েন্ট নেই! নতুন ক্লায়েন্ট যুক্ত করুন।")
        active_client_id = ""

    # MAIN WORKSPACE SCREEN (CLIENT SELECTED)
    if active_client_dict:
        st.subheader(f"💼 ক্লায়েন্ট খাতাঃ **{active_client_dict['name']}**")
        st.info(f"📍 নোট/ঠিকানাঃ {active_client_dict.get('notes', '—')} | যোগাযোগঃ {active_client_dict.get('contact', '—')}")

        # Filter entries matching active client
        client_ledgers = [item for item in ledger_entries if item["clientId"] == active_client_id]

        # ----------------------------------------------------
        # DATA ENTRY FORM For selected client
        # ----------------------------------------------------
        with st.expander("📝 খাতায় নতুন কাজের ভাউচার / লেনদেন রেকর্ড এন্ট্রি", expanded=True):
            with st.form("ledger_entry_form", clear_on_submit=False):
                col_d1, col_d2, col_d3 = st.columns(3)
                with col_d1:
                    entry_date = st.date_input("তারিখ (তারিখ)", datetime.today())
                with col_d2:
                    entry_desc = st.text_input("বিবরন / কাজের বিবরণ*", placeholder="উদাঃ সিঙ্গেল সুতা ৮ ফালির ওয়ান সিঙ্গেল")
                with col_d3:
                    entry_ply_page = st.text_input("ফালি বা পৃষ্টা (Ply/Page)", placeholder="উদাঃ পৃষ্ঠা ৩৪০")
                
                col_v1, col_v2, col_v3 = st.columns(3)
                with col_v1:
                    entry_weight = st.number_input("প্রডাক্টের ওজন (Weight - kg)*", min_value=0.0, step=0.1, value=0.0)
                with col_v2:
                    entry_rate = st.number_input("প্রডাক্টের দর (Rate - ৳)*", min_value=0.0, step=0.1, value=0.0)
                with col_v3:
                    # Dynamically calculated weight * rate
                    auto_sum = round(entry_weight * entry_rate, 2)
                    st.text_input("মোট টাকা (Auto Calculated-৳)", value=f"৳ {auto_sum}", disabled=True)
                
                entry_received = st.number_input("নগদ টাকা জমা (Received amount-৳)", min_value=0.0, step=10.0, value=0.0)
                
                form_submit = st.form_submit_button("রেকর্ড খাতায় যোগ নিশ্চিত করুন")
                
                if form_submit:
                    if not entry_desc:
                        st.error("কাজের বিবরন লিখতেই হবে!")
                    elif db_connected:
                        ledger_sh = sheet_instance.worksheet("Ledger")
                        new_eid = f"entry-{datetime.now().strftime('%H%M%S')}"
                        ledger_sh.append_row([
                            new_eid,
                            active_client_id,
                            active_client_dict["name"],
                            entry_date.strftime("%Y-%m-%d"),
                            entry_desc.strip(),
                            entry_ply_page.strip(),
                            entry_weight,
                            entry_rate,
                            auto_sum,
                            entry_received,
                            datetime.now().isoformat(),
                            current_user["name"]
                        ])
                        st.success("সফলভাবে এন্ট্রি সেভ হয়েছে!")
                        load_clients_and_ledger.clear()
                        st.rerun()
                    else:
                        st.error("গুগল ডাটাবেজ অফলাইন!")

        # ----------------------------------------------------
        # DATE RANGE FILTER FOR ACTIVE CLIENT
        # ----------------------------------------------------
        st.markdown("### 🔍 ফিল্টার এবং জর্নাল খাতা")
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            filter_start = st.date_input("শুরুর তারিখ (Start Date)", value=datetime(2026, 1, 1))
        with col_f2:
            filter_end = st.date_input("শেষের তারিখ (End Date)", value=datetime.today())

        # Apply filtering
        final_filtered = []
        for row in client_ledgers:
            row_date = datetime.strptime(row["date"], "%Y-%m-%d").date()
            if filter_start <= row_date <= filter_end:
                final_filtered.append(row)

        # STATISTICS & SUMMARIES CALCULATION
        tot_bill = sum(float(x["totalAmount"]) for x in final_filtered)
        tot_received = sum(float(x["receivedAmount"]) for x in final_filtered)
        rem_balance = tot_bill - tot_received

        st.markdown(f"""
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div class="stat-card">
                <p class="stat-title">মোট বিল (Total Bill)</p>
                <p class="stat-val">৳ {tot_bill:,.1f}</p>
            </div>
            <div class="stat-card">
                <p class="stat-title">টাকা জমা (Total Received)</p>
                <p class="stat-val" style="color: #059669;">৳ {tot_received:,.1f}</p>
            </div>
            <div class="stat-card" style="background-color: {'#fee2e2' if rem_balance > 0 else '#ecfdf5'}">
                <p class="stat-title" style="color: #991b1b;">অবশিষ্ট মোট টাকা (Remaining Dues)</p>
                <p class="stat-val" style="color: {'#dc2626' if rem_balance > 0 else '#15803d'}">৳ {rem_balance:,.1f}</p>
            </div>
        </div>
        """, unsafe_style_html=True)

        # DATA TABLE PREVIEW
        if len(final_filtered) > 0:
            df = pd.DataFrame(final_filtered)
            # Reorder nicely for display
            df_disp = df[["date", "description", "plyPage", "productWeight", "productRate", "totalAmount", "receivedAmount", "createdBy"]]
            df_disp.columns = ["তারিখ", "বিবরণ", " পৃষ্ঠা/ফালি", "ওজন (kg)", "দর (Rate)", "মোট বিল (৳)", "টাকা জমা (৳)", "এন্ট্রি কারী"]
            
            st.dataframe(df_disp, use_container_width=True)

            # Export to Excel command download
            st.markdown("### 📥 এক্সপোর্ট ও মেমো ডাউনলোড")
            col_ex1, col_ex2 = st.columns(2)
            
            with col_ex1:
                # Generate downloadable CSV
                csv_data = df_disp.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="📥 স্প্রেডশিট ডাউনলোড করুন (Download CSV/Excel)",
                    data=csv_data,
                    file_name=f"{active_client_dict['name']}_ledger.csv",
                    mime="text/csv",
                    use_container_width=True
                )
            with col_ex2:
                # Instructions to trigger browser printing layout
                st.info("💡 টিপসঃ আপনি যদি মেমো ভাউচার আকারে দেখতে চান তবে ব্রাউজারে 'Ctrl + P' চেপে পিডিএফ সেভ বা সরাসরি প্রিন্ট করতে পারেন!")
        else:
            st.info("নির্বাচিত ডেটরেঞ্জ অনুযায়ী কোনো রেকর্ডের খোঁজ মেলেনি।")
