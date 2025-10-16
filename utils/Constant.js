const couponProduction = true
const production = true

const IP = production ? "app-api.elevatelifestyle.in" : "192.168.1.130"
const CouponIP = couponProduction ? "api.elevatelifestyle.in" : "192.168.1.39"

const Protocol = production ? "https://" : "http://"
const couponProtocol = couponProduction ? "https://" : "http://"

const BaseUrl = `${Protocol}${IP}/`

const GatewayBase = production ? `${Protocol}${IP}` : `${Protocol}${IP}:8073`
const CouponGatewayBase = couponProduction ? `${couponProtocol}${CouponIP}` : `${couponProtocol}${CouponIP}:3001`

// Servicesss
export const UserService = '/userservice/'
export const AuthService = '/auth/'
export const OurBestService = '/ourbestservice/'
export const CartService = '/cartservices/'
export const SalonServices = '/generalservice/'
export const BookingServices = '/bookingservices/'
export const Specialists = '/specialists/'
export const StaffManagement = '/staffManagement/'
export const AdvertisementService = '/advertisementservice/'
export const MediaService = '/mediaservice/'
export const FileService = '/fileservice/'
export const ProductService = '/generalservice/'
export const MembershipService = '/billingservice/'
export const PackageService = '/billingservice/'
export const RoleService = '/userservice/'
export const GeneralService = '/generalservice/'
export const SeatService = '/seatsservice/'
export const ClientService = '/generalservice/'
export const UnitService = '/generalservice/'
export const InventoryService = '/generalservice/'
export const AttendanceService = '/generalservice/'
export const VendorService = '/generalservice/'
export const OrderService = '/generalservice/'
export const billingservice = '/billingservice/'
export const orders = "/orders/"
export const taskservice = '/generalservice/'
export const taskevidenceservice = '/taskevidenceservice/'
export const surveyService = "/surveyservice/"
export const clientsurveyservice = "/clientsurveyservice/"
export const closingService = "/closingservice/"
export const expenseService = "/expenseservice/"
export const CouponService = "/billingservice/"

export const cronservice = "/cronservice/"


// Configuration Constants
export const domainId = '21676'
// Authentication APIs
export const login = GatewayBase + AuthService + 'login'
export const sendOtp = GatewayBase + UserService + 'sendOtp'
export const verifyOtp = GatewayBase + UserService + 'verifyOtp'

// User Management
export const addUser = GatewayBase + UserService + 'addUser'
export const updateUser = GatewayBase + UserService + 'updateUser'
export const searchUser = GatewayBase + UserService + 'searchUser'
export const deleteUser = GatewayBase + UserService + 'deleteUser'

// Role Management
export const addRole = GatewayBase + RoleService + 'addRole'
export const updateRole = GatewayBase + RoleService + 'updateRole'
export const searchRole = GatewayBase + RoleService + 'searchRole'
export const deleteRole = GatewayBase + RoleService + 'deleteRole'

// Best Service Management

export const searchBestService = GatewayBase + OurBestService + 'searchBestService'

// Cart Management
export const addCart = GatewayBase + CartService + 'addCart'
export const searchCart = GatewayBase + CartService + 'searchCart'
export const deleteCart = GatewayBase + CartService + 'deleteCart'

// Booking Management
export const addBooking = GatewayBase + BookingServices + 'addBooking'
export const searchBooking = GatewayBase + BookingServices + 'searchBooking'

// Advertisement Management
export const addAdvertisement = GatewayBase + AdvertisementService + 'addAdvertisement'
export const updateAdvertisement = GatewayBase + AdvertisementService + 'updateAdvertisement'
export const searchAdvertisement = GatewayBase + AdvertisementService + 'searchAdvertisement'
export const deleteAdvertisement = GatewayBase + AdvertisementService + 'deleteAdvertisement'

// Media Management
export const addMedia = GatewayBase + MediaService + 'addMedia'
export const updateMedia = GatewayBase + MediaService + 'updateMedia'
export const searchMedia = GatewayBase + MediaService + 'searchMedia'
export const deleteMedia = GatewayBase + MediaService + 'deleteMedia'

// File Management

export const uploadSingle = GatewayBase + FileService + 'uploadSingle'
export const searchFiles = GatewayBase + FileService + 'searchFiles'
export const deleteFile = GatewayBase + FileService + 'deleteFile'

// Salon Services Management
export const addServices = GatewayBase + SalonServices + 'addServices'
export const updateServices = GatewayBase + SalonServices + 'updateServices'
export const searchServices = GatewayBase + SalonServices + 'searchServices'
export const deleteServices = GatewayBase + SalonServices + 'deleteServices'

// Parent Service Management
export const addParent = GatewayBase + SalonServices + 'addParent'
export const updateParent = GatewayBase + SalonServices + 'updateParent'
export const searchParent = GatewayBase + SalonServices + 'searchParent'
export const deleteParent = GatewayBase + SalonServices + 'deleteParent'
export const ParentBulkUpload = GatewayBase + SalonServices + 'bulk-upload'

// Child Service Management
export const addChild = GatewayBase + SalonServices + 'addChild'
export const updateChild = GatewayBase + SalonServices + 'updateChild'
export const searchChild = GatewayBase + SalonServices + 'searchChild'
export const deleteChild = GatewayBase + SalonServices + 'deleteChild'

// Staff Management
export const addStaff = GatewayBase + StaffManagement + 'addStaff'
export const updateStaff = GatewayBase + StaffManagement + 'updateStaff'
export const searchStaff = GatewayBase + StaffManagement + 'searchStaff'
export const deleteStaff = GatewayBase + StaffManagement + 'deleteStaff'
export const StaffBulkUpload = GatewayBase + StaffManagement + 'bulk-upload'

// Specialists Management
export const searchSpecialists = BaseUrl + Specialists + 'searchSpecialists'

// Product Management
export const addProduct = GatewayBase + ProductService + 'addProduct'
export const updateProduct = GatewayBase + ProductService + 'updateProduct'
export const searchProduct = GatewayBase + ProductService + 'searchProduct'
export const deleteProduct = GatewayBase + ProductService + 'deleteProduct'
export const ProductBulkUpload = GatewayBase + ProductService + 'bulk-upload'

// Membership Management
export const addMembership = GatewayBase + MembershipService + 'addMembership'
export const updateMembership = GatewayBase + MembershipService + 'updateMembership'
export const searchMembership = GatewayBase + MembershipService + 'searchMembership'
export const deleteMembership = GatewayBase + MembershipService + 'deleteMembership'
export const MembershipBulkUpload = GatewayBase + MembershipService + 'bulk-upload'

export const addClientMembership = GatewayBase + MembershipService + 'addClientMembership'
export const searchClientMembership = GatewayBase + MembershipService + 'searchClientMembership'
export const updateClientMembership = GatewayBase + MembershipService + 'updateClientMembership'
export const deleteClientMembership = GatewayBase + MembershipService + 'deleteClientMembership'



// Package Management
export const addPackage = GatewayBase + PackageService + 'addPackage'
export const updatePackage = GatewayBase + PackageService + 'updatePackage'
export const searchPackage = GatewayBase + PackageService + 'searchPackage'
export const deletePackage = GatewayBase + PackageService + 'deletePackage'



//General Master

export const addGeneralMaster = GatewayBase + GeneralService + 'addGeneral'
export const updateGeneralMaster = GatewayBase + GeneralService + 'updateGeneral'
export const searchGeneralMaster = GatewayBase + GeneralService + 'searchGeneral'
export const deleteGeneralMaster = GatewayBase + GeneralService + 'deleteGeneral'


//Seat Management

export const addSeat = GatewayBase + SeatService + 'addSeat'
export const updateSeat = GatewayBase + SeatService + 'updateSeat'
export const searchSeat = GatewayBase + SeatService + 'searchSeat'
export const deleteSeat = GatewayBase + SeatService + 'deleteSeat'


//ClientManagement

export const addClient = GatewayBase + ClientService + 'addClients'
export const updateClient = GatewayBase + ClientService + 'updateClients'
export const deleteClient = GatewayBase + ClientService + 'deleteClients'
export const searchClient = GatewayBase + ClientService + 'searchClients'

//graphql 
export const graphql = GatewayBase + SeatService + '/graphql'

// Unit 

export const addUnit = GatewayBase + UnitService + 'addUnit'
export const updateUnit = GatewayBase + UnitService + 'updateUnit'
export const searchUnit = GatewayBase + UnitService + 'searchUnit'
export const deleteUnit = GatewayBase + UnitService + 'deleteUnit'


// attedence

export const addAttendance = GatewayBase + AttendanceService + 'addAttendance'
export const updateAttendance = GatewayBase + AttendanceService + 'updateAttendance'
export const searchAttendance = GatewayBase + AttendanceService + 'searchAttendance'
export const deleteAttendance = GatewayBase + AttendanceService + 'deleteAttendance'


export const WsSeatGraphql = GatewayBase + SeatService + 'graphql'
export const seatGraphql = GatewayBase + SeatService + 'graphql'



//Inventory

export const addInventory = GatewayBase + InventoryService + 'addInventory'
export const bulkAddInventory = GatewayBase + InventoryService + 'bulkAddInventory'
export const searchInventory = GatewayBase + InventoryService + 'searchInventory'
export const updateInventory = GatewayBase + InventoryService + 'updateInventory'
export const deleteInventory = GatewayBase + InventoryService + 'deleteInventory'
export const updateStock = GatewayBase + InventoryService + 'updateStock'


// vendor

export const addVendor = GatewayBase + VendorService + 'addVendor'
export const updateVendor = GatewayBase + VendorService + 'updateVendor'
export const searchVendor = GatewayBase + VendorService + 'searchVendor'
export const deleteVendor = GatewayBase + VendorService + 'deleteVendor'


// Order

export const addOrder = GatewayBase + OrderService + 'addOrder'
export const updateOrder = GatewayBase + OrderService + 'updateOrder'
export const searchOrder = GatewayBase + OrderService + 'searchOrder'
export const deleteOrder = GatewayBase + OrderService + 'deleteOrder'





// billingservice
export const addBilling = GatewayBase + billingservice + 'addBilling'
export const updateBilling = GatewayBase + billingservice + 'updateBilling'
export const deleteBilling = GatewayBase + billingservice + 'deleteBilling'
export const searchBilling = GatewayBase + billingservice + 'searchBilling'

// Bill Management Endpoints
export const addBill = GatewayBase + billingservice + 'addBill'
export const searchBill = GatewayBase + billingservice + 'searchBill'
export const updateBill = GatewayBase + billingservice + 'updateBill'


// surveyService
export const addSurvey = GatewayBase + surveyService + 'addSurvey'
export const updateSurvey = GatewayBase + surveyService + 'updateSurvey'
export const deleteSurvey = GatewayBase + surveyService + 'deleteSurvey'
export const searchSurvey = GatewayBase + surveyService + 'searchSurvey'

// surveyService
export const addClientSurvey = GatewayBase + clientsurveyservice + 'addClientSurvey'
export const updateClientSurvey = GatewayBase + clientsurveyservice + 'updateClientSurvey'
export const deleteClientSurvey = GatewayBase + clientsurveyservice + 'deleteClientSurvey'
export const searchClientSurvey = GatewayBase + clientsurveyservice + 'searchClientSurvey'

// closingService
export const addClosing = GatewayBase + closingService + 'addClosing'
export const updateClosing = GatewayBase + closingService + 'updateClosing'
export const deleteClosing = GatewayBase + closingService + 'deleteClosing'
export const searchClosing = GatewayBase + closingService + 'searchClosing'

// Expense service
export const addExpense = GatewayBase + expenseService + 'addExpense'
export const updateExpense = GatewayBase + expenseService + 'updateExpense'
export const deleteExpense = GatewayBase + expenseService + 'deleteExpense'
export const searchExpense = GatewayBase + expenseService + 'searchExpense'

//coupon 

export const verifyCoupon = CouponGatewayBase + '/api/customer/verify-coupon'
export const purchaseCoupon = CouponGatewayBase + '/api/admin/purchase'

// Coupon Management Endpoints
export const addCoupon = GatewayBase + CouponService + 'addCoupon'
export const searchCoupon = GatewayBase + CouponService + 'searchCoupon'
export const updateCoupon = GatewayBase + CouponService + 'updateCoupon'
export const deleteCoupon = GatewayBase + CouponService + 'deleteCoupon'
export const validateCoupon = GatewayBase + CouponService + 'validateCoupon'


//Payments

// export const orederCreate = GatewayBase + orders + 'create-order'
export const searchWalletBalance = GatewayBase + orders + 'searchWalletBalance'
export const orederCreateTopup = GatewayBase + orders + "wallet/topup" + "/create"
export const verifyPayment = GatewayBase + orders + 'verify-payment'
export const orderCreateOnline = GatewayBase + orders + 'service/payment' + "/create"
export const walletPay = GatewayBase + orders + "wallet" + "/pay"


//task

export const createTask = GatewayBase + taskservice + 'createTask'
export const searchTask = GatewayBase + taskservice + 'searchTask'
export const deleteTask = GatewayBase + taskservice + 'deleteTask'
export const updateTask = GatewayBase + taskservice + 'updateTask'
export const searchEvidence = GatewayBase + taskevidenceservice + 'searchTaskEvidence'
export const updateTaskEvidence = GatewayBase + taskevidenceservice + 'updateTaskEvidence'


//wallet

export const searchWallet = GatewayBase + billingservice + 'searchWallet'

// Cash Balance Management
export const addCashBalance = GatewayBase + billingservice + 'addCashBalance'
export const searchCashBalance = GatewayBase + billingservice + 'searchCashBalance'
export const updateCashBalance = GatewayBase + billingservice + 'updateCashBalance'
export const deleteCashBalance = GatewayBase + billingservice + 'deleteCashBalance'

// Cash Transaction Management
export const addCashTransaction = GatewayBase + billingservice + 'addCashTransaction'
export const searchCashTransaction = GatewayBase + billingservice + 'searchCashTransaction'

// Dashboard Management
export const searchDashboard = GatewayBase + billingservice + 'searchDashboard'



//cron service

export const triggerMonthlyTask = GatewayBase + cronservice + "trigger-monthly-task"


export const Available = 'Available';
export const Occupied = 'Occupied';
export const Initiated = 'Initiated';
export const InProgress = 'InProgress';



export const legendItems = [
  { color: "emerald-500", label: "Available" },
  { color: "blue-500", label: "Initiated" },
  { color: "rose-500", label: "Occupied" },
  { color: "amber-500", label: "Maintenance" }
];