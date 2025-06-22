"use client"

import { Icon } from "@iconify/react"
import CardStat from "./CardStat"

interface My_StatsCardProps {
  title: string
  value: number | string
  icon: string // contoh: "mdi:user"
  subtitle?: string
  iconColor?: string
}

export default function My_StatsCard({
  title,
  value,
  icon,
  subtitle,
  iconColor = "#4F46E5", // default: indigo-600
}: My_StatsCardProps) {
  return (
    <CardStat
      icon={<Icon icon={icon} width={20} height={20} />}
      label={title}
      value={String(value)}
      subtitle={subtitle}
      iconColor={iconColor}
    />
  )
}
