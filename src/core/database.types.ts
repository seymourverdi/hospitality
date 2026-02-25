// City Club HMS - Database Types
// Generated from Supabase schema - Update with: npm run db:generate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'manager' | 'server' | 'host' | 'kitchen' | 'readonly';
export type OrderStatus = 'draft' | 'submitted' | 'incoming' | 'fired' | 'complete' | 'cancelled' | 'scheduled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial';
export type ReservationStatus = 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'blocked';
export type ModifierRequirement = 'required' | 'optional';
export type RoutingDestination = 'kitchen' | 'bar' | 'both';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: UserRole;
          pin_code: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: UserRole;
          pin_code?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          pin_code?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          member_number: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          notes: string | null;
          default_discount_percent: number;
          dietary_restrictions: string[] | null;
          favorite_items: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_number: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          notes?: string | null;
          default_discount_percent?: number;
          dietary_restrictions?: string[] | null;
          favorite_items?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_number?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          notes?: string | null;
          default_discount_percent?: number;
          dietary_restrictions?: string[] | null;
          favorite_items?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tables: {
        Row: {
          id: string;
          location_id: string;
          table_number: string;
          display_name: string | null;
          capacity: number;
          position_x: number;
          position_y: number;
          rotation: number;
          shape: string;
          width: number | null;
          height: number | null;
          status: TableStatus;
          current_server_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          table_number: string;
          display_name?: string | null;
          capacity?: number;
          position_x?: number;
          position_y?: number;
          rotation?: number;
          shape?: string;
          width?: number | null;
          height?: number | null;
          status?: TableStatus;
          current_server_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          table_number?: string;
          display_name?: string | null;
          capacity?: number;
          position_x?: number;
          position_y?: number;
          rotation?: number;
          shape?: string;
          width?: number | null;
          height?: number | null;
          status?: TableStatus;
          current_server_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          track_inventory: boolean;
          available_count: number | null;
          low_stock_threshold: number | null;
          routing: RoutingDestination;
          prep_time_minutes: number | null;
          allergens: string[] | null;
          dietary_tags: string[] | null;
          is_daily_special: boolean;
          available_start_time: string | null;
          available_end_time: string | null;
          is_active: boolean;
          is_visible_mobile: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          track_inventory?: boolean;
          available_count?: number | null;
          low_stock_threshold?: number | null;
          routing?: RoutingDestination;
          prep_time_minutes?: number | null;
          allergens?: string[] | null;
          dietary_tags?: string[] | null;
          is_daily_special?: boolean;
          available_start_time?: string | null;
          available_end_time?: string | null;
          is_active?: boolean;
          is_visible_mobile?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          track_inventory?: boolean;
          available_count?: number | null;
          low_stock_threshold?: number | null;
          routing?: RoutingDestination;
          prep_time_minutes?: number | null;
          allergens?: string[] | null;
          dietary_tags?: string[] | null;
          is_daily_special?: boolean;
          available_start_time?: string | null;
          available_end_time?: string | null;
          is_active?: boolean;
          is_visible_mobile?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      modifiers: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          requirement: ModifierRequirement;
          min_selections: number;
          max_selections: number | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          requirement?: ModifierRequirement;
          min_selections?: number;
          max_selections?: number | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          requirement?: ModifierRequirement;
          min_selections?: number;
          max_selections?: number | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      modifier_options: {
        Row: {
          id: string;
          modifier_id: string;
          name: string;
          price_adjustment: number;
          is_default: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          modifier_id: string;
          name: string;
          price_adjustment?: number;
          is_default?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          modifier_id?: string;
          name?: string;
          price_adjustment?: number;
          is_default?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_modifiers: {
        Row: {
          id: string;
          product_id: string;
          modifier_id: string;
          is_required: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          modifier_id: string;
          is_required?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          modifier_id?: string;
          is_required?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          member_id: string | null;
          is_non_member: boolean;
          guest_name: string | null;
          guest_count: number;
          table_id: string | null;
          seat_assignments: Json | null;
          server_id: string;
          status: OrderStatus;
          scheduled_time: string | null;
          submitted_at: string | null;
          fired_at: string | null;
          completed_at: string | null;
          subtotal: number;
          discount_percent: number | null;
          discount_amount: number | null;
          tax_amount: number | null;
          total: number;
          payment_status: PaymentStatus;
          notes: string | null;
          kitchen_notes: string | null;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: number;
          member_id?: string | null;
          is_non_member?: boolean;
          guest_name?: string | null;
          guest_count?: number;
          table_id?: string | null;
          seat_assignments?: Json | null;
          server_id: string;
          status?: OrderStatus;
          scheduled_time?: string | null;
          submitted_at?: string | null;
          fired_at?: string | null;
          completed_at?: string | null;
          subtotal?: number;
          discount_percent?: number | null;
          discount_amount?: number | null;
          tax_amount?: number | null;
          total?: number;
          payment_status?: PaymentStatus;
          notes?: string | null;
          kitchen_notes?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: number;
          member_id?: string | null;
          is_non_member?: boolean;
          guest_name?: string | null;
          guest_count?: number;
          table_id?: string | null;
          seat_assignments?: Json | null;
          server_id?: string;
          status?: OrderStatus;
          scheduled_time?: string | null;
          submitted_at?: string | null;
          fired_at?: string | null;
          completed_at?: string | null;
          subtotal?: number;
          discount_percent?: number | null;
          discount_amount?: number | null;
          tax_amount?: number | null;
          total?: number;
          payment_status?: PaymentStatus;
          notes?: string | null;
          kitchen_notes?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_line_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          modifiers: Json | null;
          modifier_total: number | null;
          notes: string | null;
          allergen_notes: string | null;
          seat_number: number | null;
          course_number: number | null;
          status: OrderStatus;
          fired_at: string | null;
          completed_at: string | null;
          line_total: number;
          discount_percent: number | null;
          discount_amount: number | null;
          routing: RoutingDestination | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity?: number;
          unit_price: number;
          modifiers?: Json | null;
          modifier_total?: number | null;
          notes?: string | null;
          allergen_notes?: string | null;
          seat_number?: number | null;
          course_number?: number | null;
          status?: OrderStatus;
          fired_at?: string | null;
          completed_at?: string | null;
          line_total: number;
          discount_percent?: number | null;
          discount_amount?: number | null;
          routing?: RoutingDestination | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          modifiers?: Json | null;
          modifier_total?: number | null;
          notes?: string | null;
          allergen_notes?: string | null;
          seat_number?: number | null;
          course_number?: number | null;
          status?: OrderStatus;
          fired_at?: string | null;
          completed_at?: string | null;
          line_total?: number;
          discount_percent?: number | null;
          discount_amount?: number | null;
          routing?: RoutingDestination | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          member_id: string | null;
          guest_name: string;
          guest_email: string | null;
          guest_phone: string | null;
          party_size: number;
          reservation_date: string;
          reservation_time: string;
          duration_minutes: number | null;
          table_id: string | null;
          location_preference: string | null;
          assigned_server_id: string | null;
          status: ReservationStatus;
          notes: string | null;
          special_occasion: string | null;
          dietary_requirements: string[] | null;
          menu_type: string | null;
          confirmation_sent: boolean | null;
          reminder_sent: boolean | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          guest_name: string;
          guest_email?: string | null;
          guest_phone?: string | null;
          party_size?: number;
          reservation_date: string;
          reservation_time: string;
          duration_minutes?: number | null;
          table_id?: string | null;
          location_preference?: string | null;
          assigned_server_id?: string | null;
          status?: ReservationStatus;
          notes?: string | null;
          special_occasion?: string | null;
          dietary_requirements?: string[] | null;
          menu_type?: string | null;
          confirmation_sent?: boolean | null;
          reminder_sent?: boolean | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string | null;
          guest_name?: string;
          guest_email?: string | null;
          guest_phone?: string | null;
          party_size?: number;
          reservation_date?: string;
          reservation_time?: string;
          duration_minutes?: number | null;
          table_id?: string | null;
          location_preference?: string | null;
          assigned_server_id?: string | null;
          status?: ReservationStatus;
          notes?: string | null;
          special_occasion?: string | null;
          dietary_requirements?: string[] | null;
          menu_type?: string | null;
          confirmation_sent?: boolean | null;
          reminder_sent?: boolean | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          module: string;
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module: string;
          key: string;
          value: Json;
          description?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: string;
          is_active: boolean;
          start_date: string | null;
          end_date: string | null;
          show_on_modules: string[] | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          type?: string;
          is_active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          show_on_modules?: string[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          show_on_modules?: string[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      has_role: {
        Args: { required_role: UserRole };
        Returns: boolean;
      };
      calculate_order_totals: {
        Args: { order_uuid: string };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      reservation_status: ReservationStatus;
      table_status: TableStatus;
      modifier_requirement: ModifierRequirement;
      routing_destination: RoutingDestination;
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Member = Database['public']['Tables']['members']['Row'];
export type Location = Database['public']['Tables']['locations']['Row'];
export type Table = Database['public']['Tables']['tables']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Modifier = Database['public']['Tables']['modifiers']['Row'];
export type ModifierOption = Database['public']['Tables']['modifier_options']['Row'];
export type ProductModifier = Database['public']['Tables']['product_modifiers']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderLineItem = Database['public']['Tables']['order_line_items']['Row'];
export type Reservation = Database['public']['Tables']['reservations']['Row'];
export type AppSetting = Database['public']['Tables']['app_settings']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Notice = Database['public']['Tables']['notices']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type MemberInsert = Database['public']['Tables']['members']['Insert'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderLineItemInsert = Database['public']['Tables']['order_line_items']['Insert'];
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type MemberUpdate = Database['public']['Tables']['members']['Update'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];
export type OrderLineItemUpdate = Database['public']['Tables']['order_line_items']['Update'];
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update'];

// Extended types with relations
export interface ProductWithModifiers extends Product {
  category: Category;
  modifiers: (ProductModifier & { modifier: Modifier & { options: ModifierOption[] } })[];
}

export interface OrderWithDetails extends Order {
  member: Member | null;
  table: Table | null;
  server: Profile;
  line_items: (OrderLineItem & { product: Product })[];
}

export interface ReservationWithDetails extends Reservation {
  member: Member | null;
  table: Table | null;
  assigned_server: Profile | null;
  location: Location | null;
}
