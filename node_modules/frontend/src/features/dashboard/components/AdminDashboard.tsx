"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/shared/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

type Stats = {
  revenueToday: number
  revenueMonth: number
  ordersToday: number
  totalOrders: number
}

export default function AdminDashboard() {

  const [stats,setStats] = useState<Stats | null>(null)

  useEffect(()=>{
    async function load(){
      const res = await apiFetch("/orders/analytics")
      const data = await res?.json()
      setStats(data)
    }
    load()
  },[])

  if(!stats) return <p>Cargando dashboard...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

      <Card>
        <CardHeader>
          <CardTitle>Revenue Today</CardTitle>
        </CardHeader>
        <CardContent>
          €{(stats.revenueToday/100).toFixed(2)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Month</CardTitle>
        </CardHeader>
        <CardContent>
          €{(stats.revenueMonth/100).toFixed(2)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders Today</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.ordersToday}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.totalOrders}
        </CardContent>
      </Card>

    </div>
  )
}