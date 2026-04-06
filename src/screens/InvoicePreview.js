import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Share2,
  Printer,
} from 'lucide-react-native';
import { COLORS } from '../constants/Colors';
import { numberToIndianWords } from '../utils/numberToIndianWords';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Step4({ route, navigation }) {
  const invoiceData = route?.params?.invoice || {};
  console.log('Preview data', invoiceData);
  const items = invoiceData?.items || [];

  const grandTotal = invoiceData?.grandTotal || 0;

  const rupees = Math.floor(grandTotal);
  const paise = Math.round((grandTotal % 1) * 100);

  const amountInWords = `${numberToIndianWords(rupees)} ${
    paise ? `and ${numberToIndianWords(paise)} paise` : ''
  } only`;

  const saveInvoice = async () => {
    try {
      const existing = await AsyncStorage.getItem('invoices');

      let invoices = existing ? JSON.parse(existing) : [];

      invoices.push(invoiceData);

      await AsyncStorage.setItem('invoices', JSON.stringify(invoices));

      alert('Invoice saved successfully');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft size={30} color="#111" />
            </TouchableOpacity>

            <View style={{ marginLeft: 10 }}>
              <Text style={styles.title}>Invoice Preview</Text>
              <Text style={styles.subtitle}>Aadhi Engine Service</Text>
            </View>
          </View>

          <ScrollView>
            {/* Company Info */}
            <View style={styles.companyHeader}>
              <Text style={styles.company}>Aadhi Engine Services</Text>
              <View style={styles.divider} />
              <View style={styles.gridWrapper}>
                {/* Left Column */}
                <View style={styles.gridCol}>
                  <Text style={[styles.address, { color: COLORS.primary }]}>
                    Kirloskar spares for R/HA/R1040
                  </Text>
                  <Text style={{ color: COLORS.primary }}>
                    3 rd street Thammal colony
                  </Text>
                  <Text style={{ color: COLORS.primary }}>Tuticorin - 2</Text>
                  <Text style={{ color: COLORS.primary }}>
                    Email: kingincare@gmail.com
                  </Text>
                  <Text style={{ color: COLORS.primary }}>
                    Cell: 9865254161
                  </Text>
                </View>

                {/* Right Column */}
                <View
                  style={[
                    styles.gridCol,
                    { justifyContent: 'center', alignItems: 'flex-end' },
                  ]}
                >
                  <Text style={{ color: COLORS.primary }}>
                    Bill No :
                    <Text style={{ fontWeight: 600 }}>
                      {' '}
                      {invoiceData?.invoiceNumber}
                    </Text>
                  </Text>
                  <Text style={{ color: COLORS.primary }}>
                    Date :{' '}
                    <Text style={{ fontWeight: 600 }}>
                      {' '}
                      {invoiceData?.date}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.dividerDouble} />

            {/* Customer */}
            <View style={styles.gridWrapper}>
              <Text style={{ color: COLORS.primary }}>
                To :{' '}
                <Text style={{ fontWeight: 600 }}>
                  {' '}
                  {invoiceData?.customerName}
                </Text>
              </Text>
              <Text style={{ color: COLORS.primary }}>
                Payment Mode :{' '}
                <Text style={{ fontWeight: 600 }}>
                  {' '}
                  {invoiceData?.paymentMode}
                </Text>
              </Text>
            </View>

            {/* Table */}
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.colSno}>S.No</Text>
                <Text style={styles.colDesc}>Description</Text>
                <Text style={styles.colQty}>Qty</Text>
                <Text style={styles.colPrice}>Unit Price</Text>
                <Text style={styles.colTotal}>Total</Text>
              </View>

              {/* Table Rows */}
              {invoiceData?.products.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.colSnoData}>{index + 1}</Text>
                  <Text style={styles.colDescData}>{item.name}</Text>
                  <Text style={styles.colQtyData}>{item.quantity}</Text>
                  <Text style={styles.colPriceData}>
                    ₹{item.price.toFixed(2)}
                  </Text>
                  <Text style={styles.colTotalData}>
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.gridWrapper}>
              {/* Amount in Words */}
              <View style={styles.words}>
                <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>
                  Total in Words :
                </Text>
                <Text style={{ color: COLORS.primary }}>{amountInWords}</Text>
              </View>
              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total :</Text>
                <Text style={styles.totalValue}>₹{grandTotal}</Text>
              </View>
            </View>

            {/* Signature */}
            <View style={styles.signature}>
              <Text>For Aadhi Engine Services</Text>
            </View>

            <Text
              style={{
                fontWeight: 'regular',
                color: COLORS.primary,
                textAlign: 'center',
                marginVertical: 20,
              }}
            >
              Only genuine <Text style={{ fontWeight: 900 }}>KIRLOSKAR</Text>{' '}
              Spares and <Text style={{ fontWeight: 900 }}>K-OIL</Text> for your
              Kirloskar Engine's Life long Care
            </Text>

            <View style={styles.bottomSection}>
              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={saveInvoice}>
                <View style={styles.btnContent}>
                  <Save size={20} color="#fff" />
                  <Text style={styles.saveText}>Save Invoice</Text>
                </View>
              </TouchableOpacity>

              {/* Share + Print */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn}>
                  <View style={styles.btnContent}>
                    <Share2 size={20} color="#333" />
                    <Text style={styles.actionText}>Share</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <View style={styles.btnContent}>
                    <Printer size={20} color="#333" />
                    <Text style={styles.actionText}>Print</Text>
                  </View>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#f4f6fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.primary,
    marginVertical: 10,
  },

  dividerDouble: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
    height: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  gridWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },

  gridCol: {
    flex: 1,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 16,
  },

  companyHeader: {
    marginTop: 20,
  },

  company: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: '60%',
    backgroundColor: COLORS.primary,
    color: 'white',
    textDecorationLine: 'underline',
  },

  address: {
    fontWeight: '600',
  },

  billRow: {
    flexDirection: 'col',
    justifyContent: 'space-between',
    marginVertical: 8,
  },

  /* Table */

  table: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
  },

  tableRow: {
    flexDirection: 'row',
  },

  /* Header Columns */

  colSno: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#fff',
  },

  colDesc: {
    flex: 3,
    color: '#fff',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#fff',
  },

  colQty: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#fff',
  },

  colPrice: {
    flex: 2,
    color: '#fff',
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#fff',
  },

  colTotal: {
    flex: 2,
    color: '#fff',
    textAlign: 'center',
    padding: 8,
  },

  /* Data Columns */

  colSnoData: {
    flex: 1,
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: COLORS.primary,
  },

  colDescData: {
    flex: 3,
    padding: 8,
    borderRightWidth: 1,
    borderColor: COLORS.primary,
  },

  colQtyData: {
    flex: 1,
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: COLORS.primary,
  },

  colPriceData: {
    flex: 2,
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: COLORS.primary,
  },

  colTotalData: {
    flex: 2,
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: COLORS.primary,
  },

  /* Total */

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },

  totalLabel: {
    fontWeight: 'bold',
    marginRight: 10,
    color: COLORS.primary,
  },

  totalValue: {
    fontWeight: '900',
    color: COLORS.primary,
  },

  words: {
    marginTop: 20,
  },

  signature: {
    alignItems: 'flex-end',
    marginTop: 40,
  },

  bottomSection: {
    marginVertical: 20,
  },

  saveButton: {
    backgroundColor: '#22479c',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  actionBtn: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
