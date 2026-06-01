import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  Share2,
  Printer,
  PhoneCall,
  MapPin,
  Mail,
  CalendarDays,
  ReceiptText,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { COLORS } from '../constants/Colors';
import { numberToIndianWords } from '../utils/numberToIndianWords';
import { invoiceService } from '../services/invoiceService';

const SkeletonLine = ({ style }) => (
  <View style={[styles.skeletonLine, style]} />
);

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonCompanyHeader}>
      <SkeletonLine style={{ width: '80%', height: 28, marginBottom: 8 }} />
      <SkeletonLine style={{ width: '90%', height: 16 }} />
    </View>
    
    <View style={styles.skeletonInfoGrid}>
      <View style={{ flex: 1.2 }}>
        <SkeletonLine style={{ width: '90%', height: 14, marginBottom: 6 }} />
        <SkeletonLine style={{ width: '70%', height: 14, marginBottom: 6 }} />
        <SkeletonLine style={{ width: '85%', height: 14, marginBottom: 6 }} />
        <SkeletonLine style={{ width: '60%', height: 14 }} />
      </View>
      <View style={{ flex: 0.9, alignItems: 'flex-end' }}>
        <SkeletonLine style={{ width: '100%', height: 14, marginBottom: 8 }} />
        <SkeletonLine style={{ width: '80%', height: 14 }} />
      </View>
    </View>
  </View>
);

const SkeletonCustomerCard = () => (
  <View style={styles.skeletonCard}>
    <SkeletonLine style={{ width: '40%', height: 18, marginBottom: 12 }} />
    <View style={styles.skeletonCustomerBox}>
      <SkeletonLine style={{ width: '30%', height: 12, marginBottom: 6 }} />
      <SkeletonLine style={{ width: '70%', height: 20, marginBottom: 10 }} />
      <SkeletonLine style={{ width: '85%', height: 44 }} />
    </View>
  </View>
);

const SkeletonItemsCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonTableHeader}>
      <SkeletonLine style={{ flex: 0.8, height: 18 }} />
      <SkeletonLine style={{ flex: 3, height: 18 }} />
      <SkeletonLine style={{ flex: 0.9, height: 18 }} />
      <SkeletonLine style={{ flex: 1.5, height: 18 }} />
      <SkeletonLine style={{ flex: 1.5, height: 18 }} />
    </View>
    
    {[1, 2, 3].map((_, idx) => (
      <View style={styles.skeletonTableRow} key={idx}>
        <SkeletonLine style={{ flex: 0.8, height: 16, marginBottom: 0 }} />
        <SkeletonLine style={{ flex: 3, height: 16, marginBottom: 0 }} />
        <SkeletonLine style={{ flex: 0.9, height: 16, marginBottom: 0 }} />
        <SkeletonLine style={{ flex: 1.5, height: 16, marginBottom: 0 }} />
        <SkeletonLine style={{ flex: 1.5, height: 16, marginBottom: 0 }} />
      </View>
    ))}
  </View>
);

const SkeletonTotalCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonTotalRow}>
      <SkeletonLine style={{ width: '40%', height: 22 }} />
      <SkeletonLine style={{ width: '30%', height: 26 }} />
    </View>
    <SkeletonLine style={{ width: '100%', height: 14, marginVertical: 12 }} />
    <SkeletonLine style={{ width: '100%', height: 18 }} />
    <SkeletonLine style={{ width: '100%', height: 18, marginTop: 6 }} />
  </View>
);

export default function Step4({ route, navigation }) {
  // ALL useState hooks must be at the TOP, before any useEffect
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const invoiceID = route?.params?.invoiceId;
      const data = await invoiceService.getById(invoiceID);
      console.log('Fetched invoice data:', data);
      setInvoiceData(data);
    } catch (error) {
      console.error('Invoice fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('InvoiceForm', {
      editMode: true,
      invoiceData: invoiceData,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const invoiceID = route?.params?.invoiceId;
              await invoiceService.delete(invoiceID);
              Alert.alert('Success', 'Invoice deleted successfully ✅');
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete invoice ❌');
            }
          },
        },
      ],
    );
  };

  const dialCall = phoneNumber => {
    if (!phoneNumber) return;

    Linking.openURL(`tel:${phoneNumber}`).catch(err => {
      console.log(err);
      Alert.alert('Error', 'Unable to open dialer');
    });
  };

  const customerPhone =
    invoiceData?.customer?.mobile || invoiceData?.customer?.phone || '';
  const items = invoiceData?.items || [];

  const grandTotal =
    invoiceData?.items?.reduce(
      (total, item) => total + item.qty * item.unitPrice,
      0,
    ) || 0;

  const rupees = Math.floor(grandTotal);
  const paise = Math.round((grandTotal % 1) * 100);

  const amountInWords = `${numberToIndianWords(rupees)} ${
    paise ? `and ${numberToIndianWords(paise)} paise` : ''
  } only`;

  const invoiceDate = invoiceData?.invoiceDate
    ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.iconBtn} />
              <View style={{ flex: 1 }}>
                <SkeletonLine style={{ width: '70%', height: 32 }} />
                <SkeletonLine style={{ width: '50%', height: 16, marginTop: 6 }} />
              </View>
              <View style={styles.actionIcons}>
                <View style={styles.iconBtnSmall} />
                <View style={[styles.iconBtnSmall, { marginLeft: 8 }]} />
              </View>
            </View>

            <SkeletonCard />
            <SkeletonCustomerCard />
            <SkeletonItemsCard />
            <SkeletonTotalCard />

            <View style={styles.actionRow}>
              <View style={styles.actionBtn} />
              <View style={styles.actionBtn} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconBtn}
            >
              <ChevronLeft size={26} color="#111" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Invoice Preview</Text>
              <Text style={styles.subtitle}>Aadhi Engine Services</Text>
            </View>
            <View style={styles.actionIcons}>
              <TouchableOpacity
                onPress={handleEdit}
                style={styles.iconBtnSmall}
              >
                <Pencil size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.iconBtnSmall}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.companyHeader}>
                <Text style={styles.companyName}>Aadhi Engine Services</Text>
                <Text style={styles.companyTag}>
                  Kirloskar spares for R/HA/R1040
                </Text>
              </View>

              <View style={styles.infoBlockRight}>
                <View style={styles.metaRow}>
                  <ReceiptText size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>
                    Bill No:{' '}
                    <Text style={styles.metaValue}>
                      {invoiceData?.invoiceCode || '-'}
                    </Text>
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <CalendarDays size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>
                    Date: <Text style={styles.metaValue}>{invoiceDate}</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoBlock}>
                  <View style={styles.inlineRow}>
                    <MapPin size={14} color={COLORS.primary} />
                    <Text style={styles.infoText}>
                      3rd Street, Muthammal Colony
                    </Text>
                  </View>
                  <Text style={styles.infoText}>Tuticorin - 2</Text>
                  <View style={styles.inlineRow}>
                    <Mail size={14} color={COLORS.primary} />
                    <Text style={styles.infoText}>kingincare@gmail.com</Text>
                  </View>

                  <View style={styles.inlineRow}>
                    <PhoneCall size={14} color={COLORS.primary} />
                    <Text style={[styles.infoText, styles.callText]}>
                      9865254161{' '}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Customer Details</Text>
              </View>
              <View style={styles.customerBox}>
                <Text style={styles.customerLabel}>To</Text>
                <Text style={styles.customerName}>
                  {invoiceData?.customer?.name || '-'}
                </Text>
                
                {customerPhone ? (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => dialCall(customerPhone)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.callIconContainer}>
                      <View style={styles.blinkingRing} />
                      <View style={styles.blinkingRing2} />
                      <PhoneCall size={16} color="#fff" style={styles.callIcon} />
                    </View>
                    <Text style={styles.callButtonText}>
                      {customerPhone}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.noPhoneText}>No phone number available</Text>
                )}

                {invoiceData?.paymentStatus !== 'PENDING' && (
                  <Text style={styles.customerSub}>
                    Payment Mode: {invoiceData?.paymentMode || '-'}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.tableHeader}>
                <Text style={styles.colSno}>S.No</Text>
                <Text style={styles.colDesc}>Description</Text>
                <Text style={styles.colQty}>Qty</Text>
                <Text style={styles.colPrice}>Rate</Text>
                <Text style={styles.colTotal}>Amount</Text>
              </View>

              {items.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.colSnoData}>{index + 1}</Text>
                  <Text style={styles.colDescData}>{item.name}</Text>
                  <Text style={styles.colQtyData}>{item.qty}</Text>
                  <Text style={styles.colPriceData}>
                    ₹{item.unitPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.colTotalData}>
                    ₹{(item.qty * item.unitPrice).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
              </View>

              <Text style={styles.wordsLabel}>Amount in words</Text>
              <Text style={styles.wordsText}>{amountInWords}</Text>
            </View>

            <Text style={styles.footerText}>
              Only genuine <Text style={styles.footerStrong}>KIRLOSKAR</Text>{' '}
              Spares and <Text style={styles.footerStrong}>K-OIL</Text> for your
              Kirloskar engine's lifelong care.
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <Share2 size={18} color="#333" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <Printer size={18} color="#333" />
                <Text style={styles.actionText}>Print</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  iconBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginLeft: 8,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  companyHeader: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  companyName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  companyTag: {
    color: '#fff',
    marginTop: 4,
    opacity: 0.92,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  infoBlock: {
    flex: 1.2,
  },
  infoBlockRight: {
    flex: 0.9,
    alignItems: 'flex-end',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    color: COLORS.primary,
    fontSize: 13,
  },
  callText: {
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  metaText: {
    color: COLORS.primary,
    fontSize: 13,
    textAlign: 'right',
  },
  metaValue: {
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  customerBox: {
    backgroundColor: '#F8FAFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7ECF8',
  },
  customerLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  customerSub: {
    marginTop: 6,
    color: '#555',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F6',
  },
  colSno: {
    flex: 0.8,
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    fontWeight: '700',
  },
  colDesc: {
    flex: 3,
    color: '#fff',
    padding: 10,
    fontWeight: '700',
  },
  colQty: {
    flex: 0.9,
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    fontWeight: '700',
  },
  colPrice: {
    flex: 1.5,
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    fontWeight: '700',
  },
  colTotal: {
    flex: 1.5,
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    fontWeight: '700',
  },
  colSnoData: {
    flex: 0.8,
    textAlign: 'center',
    padding: 10,
    color: '#222',
  },
  colDescData: {
    flex: 3,
    padding: 10,
    color: '#222',
  },
  colQtyData: {
    flex: 0.9,
    textAlign: 'center',
    padding: 10,
    color: '#222',
  },
  colPriceData: {
    flex: 1.5,
    textAlign: 'center',
    padding: 10,
    color: '#222',
  },
  colTotalData: {
    flex: 1.5,
    textAlign: 'center',
    padding: 10,
    color: '#222',
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDF0F6',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  wordsLabel: {
    marginTop: 10,
    color: '#666',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  wordsText: {
    marginTop: 4,
    color: '#111',
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.primary,
    marginVertical: 12,
    lineHeight: 20,
  },
  footerStrong: {
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#22C55E',
  },
  callIconContainer: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  blinkingRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#22C55E',
    opacity: 0.6,
  },
  blinkingRing2: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#22C55E',
    opacity: 0.3,
  },
  callIcon: {
    zIndex: 1,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
    flex: 1,
  },
  noPhoneText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic',
  },
  skeletonLine: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    height: 16,
    marginBottom: 8,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  skeletonCompanyHeader: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  skeletonInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  skeletonCustomerBox: {
    backgroundColor: '#F8FAFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7ECF8',
  },
  skeletonTableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  skeletonTableRow: {
    flexDirection: 'row',
    padding: 10,
  },
  skeletonTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDF0F6',
  },
});