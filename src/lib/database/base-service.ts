import { supabase, createAdminClient, DatabaseResponse, QueryOptions } from './supabase'
import { Database } from '@/types/database'
import { PostgrestError, PostgrestResponse } from '@supabase/supabase-js'

export abstract class BaseService<T extends Record<string, any>> {
  protected client = supabase
  protected adminClient = createAdminClient()
  protected abstract tableName: string

  // Convert Supabase error to our standardized format
  protected handleError(error: PostgrestError): DatabaseResponse<T> {
    return {
      data: null,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        details: error.details,
        hint: error.hint
      }
    }
  }

  // Convert successful response to our standardized format
  protected handleResponse<K>(response: PostgrestResponse<K>): DatabaseResponse<K> {
    if (response.error) {
      return this.handleError(response.error) as DatabaseResponse<K>
    }

    return {
      data: response.data,
      error: null,
      count: response.count || undefined
    }
  }

  // Build query with common options
  protected buildQuery(queryBuilder: any, options: QueryOptions = {}) {
    let query = queryBuilder

    if (options.select) {
      query = query.select(options.select)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 0)) - 1)
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.order === 'asc' })
    }

    return query
  }

  // Generic CRUD operations
  async create(data: Partial<T>, useAdmin = false): Promise<DatabaseResponse<T>> {
    const client = useAdmin ? this.adminClient : this.client
    const response = await client
      .from(this.tableName)
      .insert(data)
      .select()
      .single()

    return this.handleResponse(response)
  }

  async findById(id: string, options: QueryOptions = {}): Promise<DatabaseResponse<T>> {
    const query = this.buildQuery(
      this.client.from(this.tableName).select(options.select || '*'),
      options
    )
    
    const response = await query.eq('id', id).single()
    return this.handleResponse(response)
  }

  async findMany(
    filters: Record<string, any> = {},
    options: QueryOptions = {}
  ): Promise<DatabaseResponse<T[]>> {
    let query = this.buildQuery(
      this.client.from(this.tableName).select(options.select || '*'),
      options
    )

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const response = await query
    return this.handleResponse(response)
  }

  async update(id: string, data: Partial<T>, useAdmin = false): Promise<DatabaseResponse<T>> {
    const client = useAdmin ? this.adminClient : this.client
    const response = await client
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    return this.handleResponse(response)
  }

  async delete(id: string, useAdmin = false): Promise<DatabaseResponse<null>> {
    const client = useAdmin ? this.adminClient : this.client
    const response = await client
      .from(this.tableName)
      .delete()
      .eq('id', id)

    return this.handleResponse(response)
  }

  async upsert(data: Partial<T>, useAdmin = false): Promise<DatabaseResponse<T>> {
    const client = useAdmin ? this.adminClient : this.client
    const response = await client
      .from(this.tableName)
      .upsert(data)
      .select()
      .single()

    return this.handleResponse(response)
  }

  // Bulk operations
  async bulkCreate(data: Partial<T>[], useAdmin = false): Promise<DatabaseResponse<T[]>> {
    const client = useAdmin ? this.adminClient : this.client
    const response = await client
      .from(this.tableName)
      .insert(data)
      .select()

    return this.handleResponse(response)
  }

  async bulkUpdate(
    updates: { id: string; data: Partial<T> }[],
    useAdmin = false
  ): Promise<DatabaseResponse<T[]>> {
    const client = useAdmin ? this.adminClient : this.client
    const results: T[] = []

    for (const update of updates) {
      const response = await client
        .from(this.tableName)
        .update(update.data)
        .eq('id', update.id)
        .select()
        .single()

      if (response.error) {
        return this.handleError(response.error) as DatabaseResponse<T[]>
      }

      results.push(response.data)
    }

    return {
      data: results,
      error: null
    }
  }

  async bulkDelete(ids: string[], useAdmin = false): Promise<DatabaseResponse<null>> {
    const client = useAdmin ? this.adminClient : this.client
    const response = await client
      .from(this.tableName)
      .delete()
      .in('id', ids)

    return this.handleResponse(response)
  }

  // Count operations
  async count(filters: Record<string, any> = {}): Promise<DatabaseResponse<number>> {
    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const response = await query
    if (response.error) {
      return this.handleError(response.error) as DatabaseResponse<number>
    }

    return {
      data: response.count || 0,
      error: null
    }
  }

  // Search operations
  async search(
    column: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<DatabaseResponse<T[]>> {
    const searchQuery = this.buildQuery(
      this.client.from(this.tableName).select(options.select || '*'),
      options
    )

    const response = await searchQuery.textSearch(column, query)
    return this.handleResponse(response)
  }

  async fullTextSearch(
    query: string,
    options: QueryOptions = {}
  ): Promise<DatabaseResponse<T[]>> {
    const searchQuery = this.buildQuery(
      this.client.from(this.tableName).select(options.select || '*'),
      options
    )

    const response = await searchQuery.textSearch('fts', query)
    return this.handleResponse(response)
  }

  // Real-time subscriptions
  subscribeToChanges(
    callback: (payload: any) => void,
    options: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      filter?: string
    } = {}
  ) {
    return this.client
      .channel(`${this.tableName}_changes`)
      .on('postgres_changes', {
        event: options.event || '*',
        schema: 'public',
        table: this.tableName,
        filter: options.filter
      }, callback)
      .subscribe()
  }

  // Utility methods
  async exists(id: string): Promise<boolean> {
    const response = await this.client
      .from(this.tableName)
      .select('id')
      .eq('id', id)
      .single()

    return !response.error
  }

  async getTableInfo(): Promise<DatabaseResponse<any>> {
    const response = await this.client
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', this.tableName)

    return this.handleResponse(response)
  }

  // Transaction support (when available)
  async withTransaction<K>(
    operations: (client: typeof this.client) => Promise<K>
  ): Promise<K> {
    // Note: Supabase doesn't support transactions in the same way as traditional SQL
    // This is a placeholder for future implementation or can be overridden by specific services
    return operations(this.client)
  }
}