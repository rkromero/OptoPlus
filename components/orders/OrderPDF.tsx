"use client"

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        backgroundColor: "#FFFFFF",
        padding: 48,
        fontSize: 10,
        color: "#1E293B",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32,
        paddingBottom: 20,
        borderBottom: "2px solid #6366F1",
    },
    brand: {
        fontSize: 20,
        fontFamily: "Helvetica-Bold",
        color: "#6366F1",
        letterSpacing: 0.5,
    },
    brandSub: {
        fontSize: 9,
        color: "#64748B",
        marginTop: 3,
    },
    orderInfo: {
        textAlign: "right",
    },
    orderNumber: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        color: "#1E293B",
    },
    orderDate: {
        fontSize: 9,
        color: "#64748B",
        marginTop: 2,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: "#6366F1",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 8,
    },
    clientBox: {
        backgroundColor: "#F8FAFC",
        borderRadius: 6,
        padding: 12,
    },
    clientName: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        color: "#0F172A",
    },
    clientDetail: {
        fontSize: 9,
        color: "#64748B",
        marginTop: 2,
    },
    table: {
        width: "100%",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        borderRadius: 4,
        padding: "8px 10px",
        marginBottom: 4,
    },
    tableRow: {
        flexDirection: "row",
        padding: "8px 10px",
        borderBottom: "1px solid #F1F5F9",
    },
    colProduct: { flex: 3 },
    colQty: { flex: 1, textAlign: "center" },
    colPrice: { flex: 1.5, textAlign: "right" },
    colSubtotal: { flex: 1.5, textAlign: "right" },
    headerText: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    cellText: {
        fontSize: 9,
        color: "#1E293B",
    },
    cellTextMuted: {
        fontSize: 8,
        color: "#94A3B8",
    },
    totalsWrapper: {
        marginTop: 16,
        paddingTop: 12,
        borderTop: "2px solid #E2E8F0",
        alignItems: "flex-end",
    },
    totalsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 4,
        width: 200,
    },
    totalsLabel: {
        fontSize: 9,
        color: "#64748B",
        flex: 1,
    },
    totalsValue: {
        fontSize: 9,
        color: "#1E293B",
        textAlign: "right",
    },
    totalFinal: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 8,
        width: 200,
        paddingTop: 8,
        borderTop: "1px solid #CBD5E1",
    },
    totalLabel: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#1E293B",
        flex: 1,
    },
    totalValue: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#6366F1",
        textAlign: "right",
    },
    footer: {
        position: "absolute",
        bottom: 32,
        left: 48,
        right: 48,
        borderTop: "1px solid #E2E8F0",
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 8,
        color: "#94A3B8",
    },
    badge: {
        backgroundColor: "#EEF2FF",
        borderRadius: 10,
        padding: "2px 8px",
        alignSelf: "flex-start",
    },
    badgeText: {
        fontSize: 8,
        color: "#6366F1",
        fontFamily: "Helvetica-Bold",
    },
})

function formatARS(amount: number) {
    return `$${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
}

interface OrderPDFProps {
    order: any
    company: any
}

export default function OrderPDF({ order, company }: OrderPDFProps) {
    const subtotal = order.items.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitPrice,
        0
    )
    const discountAmount = subtotal * ((order.discount || 0) / 100)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>OptovisionPlus</Text>
                        <Text style={styles.brandSub}>{company?.address || "Sistema de Gestión Óptica"}</Text>
                        {company?.phone && <Text style={styles.brandSub}>{company.phone}</Text>}
                    </View>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderNumber}>Remito #{String(order.orderNumber).padStart(5, "0")}</Text>
                        <Text style={styles.orderDate}>
                            {format(new Date(order.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                        </Text>
                        <View style={[styles.badge, { marginTop: 6 }]}>
                            <Text style={styles.badgeText}>{order.status}</Text>
                        </View>
                    </View>
                </View>

                {/* Client */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Datos del Cliente</Text>
                    <View style={styles.clientBox}>
                        <Text style={styles.clientName}>{order.client.fullName}</Text>
                        {order.client.dni && (
                            <Text style={styles.clientDetail}>DNI / CUIT: {order.client.dni}</Text>
                        )}
                        {order.client.email && (
                            <Text style={styles.clientDetail}>{order.client.email}</Text>
                        )}
                        {order.client.phone && (
                            <Text style={styles.clientDetail}>{order.client.phone}</Text>
                        )}
                    </View>
                </View>

                {/* Items table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detalle del Pedido</Text>
                    <View style={styles.table}>
                        {/* Table header */}
                        <View style={styles.tableHeader}>
                            <View style={styles.colProduct}><Text style={styles.headerText}>Producto</Text></View>
                            <View style={styles.colQty}><Text style={[styles.headerText, { textAlign: "center" }]}>Cant.</Text></View>
                            <View style={styles.colPrice}><Text style={[styles.headerText, { textAlign: "right" }]}>Precio Unit.</Text></View>
                            <View style={styles.colSubtotal}><Text style={[styles.headerText, { textAlign: "right" }]}>Subtotal</Text></View>
                        </View>

                        {/* Rows */}
                        {order.items.map((item: any, index: number) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.colProduct}>
                                    <Text style={styles.cellText}>{item.product.name}</Text>
                                    <Text style={styles.cellTextMuted}>{item.product.model}</Text>
                                </View>
                                <View style={styles.colQty}>
                                    <Text style={[styles.cellText, { textAlign: "center" }]}>{item.quantity}</Text>
                                </View>
                                <View style={styles.colPrice}>
                                    <Text style={[styles.cellText, { textAlign: "right" }]}>
                                        {formatARS(item.unitPrice)}
                                    </Text>
                                </View>
                                <View style={styles.colSubtotal}>
                                    <Text style={[styles.cellText, { textAlign: "right" }]}>
                                        {formatARS(item.quantity * item.unitPrice)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Totals */}
                    <View style={styles.totalsWrapper}>
                        <View style={styles.totalsRow}>
                            <Text style={styles.totalsLabel}>Subtotal</Text>
                            <Text style={styles.totalsValue}>{formatARS(subtotal)}</Text>
                        </View>
                        {(order.discount || 0) > 0 && (
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>Descuento ({order.discount}%)</Text>
                                <Text style={[styles.totalsValue, { color: "#10B981" }]}>
                                    - {formatARS(discountAmount)}
                                </Text>
                            </View>
                        )}
                        <View style={styles.totalFinal}>
                            <Text style={styles.totalLabel}>TOTAL</Text>
                            <Text style={styles.totalValue}>{formatARS(order.total)}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                {order.notes && (
                    <View style={[styles.section, { marginTop: 8 }]}>
                        <Text style={styles.sectionTitle}>Notas</Text>
                        <Text style={{ fontSize: 9, color: "#64748B" }}>{order.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>OptovisionPlus — Sistema de Gestión Óptica</Text>
                    <Text style={styles.footerText}>Remito #{String(order.orderNumber).padStart(5, "0")}</Text>
                </View>
            </Page>
        </Document>
    )
}
