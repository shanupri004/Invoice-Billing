import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import { buildInvoiceHtml } from '../utils/invoiceHtml';
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
  Download,
  Trash2,
  X,
} from 'lucide-react-native';
import { Switch } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';
import RNPrint from 'react-native-print';

import { COLORS } from '../constants/Colors';
import { numberToIndianWords } from '../utils/numberToIndianWords';
import { invoiceService } from '../services/invoiceService';
import { useTranslation } from '../localization/LanguageContext';
import Text from '../components/AppText';

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
  const { t } = useTranslation();
  const paymentModeLabels = {
    Cash: t('common.cash'),
    UPI: t('common.upi'),
    Card: t('common.card'),
    'Net Banking': t('common.netBanking'),
  };
  // ALL useState hooks must be at the TOP, before any useEffect
  const [invoiceData, setInvoiceData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfFilePath, setPdfFilePath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('Cash');
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [sign, setSign] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
    const targetScreen =
      invoiceData?.invoiceType === 'LABOUR' ? 'LabourInvoiceForm' : 'InvoiceForm';
    navigation.navigate(targetScreen, {
      editMode: true,
      invoiceData: invoiceData,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.deleteInvoiceTitle'),
      t('common.deleteInvoiceMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const invoiceID = route?.params?.invoiceId;
              await invoiceService.remove(invoiceID);
              Alert.alert(t('common.success'), t('common.invoiceDeleted'));
              navigation.navigate('InvoiceList', {
                refresh: true,
              });
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(t('common.error'), t('common.failedDeleteInvoice'));
            }
          },
        },
      ],
    );
  };

  const buildPdfFileName = () => {
    const parts = [
      invoiceData?.customer?.name,
      invoiceData?.invoiceType,
      "INVOICE",
      invoiceData?.billNo,
    ].filter(Boolean);
    return parts.join('_');
  };

  const handlePreviewPdf = async () => {
    if (!invoiceData) return;
    setPdfLoading(true);
    try {
      const html = buildInvoiceHtml({
        invoiceData,
        items,
        sign,
        amountInWords,
        grandTotal,
      });

      const options = {
        html,
        fileName: buildPdfFileName(),
        // No `directory` option: keeps the PDF in the app's cache/tmp dir,
        // which react-native-share's FileProvider config actually exposes.
        // 'Documents' saves outside that config and breaks Share with
        // "Failed to find configured root" on Android.
        base64: false,
      };

      const pdf = await generatePDF(options);
      // pdf.filePath already includes 'file://' prefix on both platforms usually

      if (!pdf?.filePath) {
        throw new Error('PDF file path not generated.');
      }

      // react-native-html-to-pdf writes via File.createTempFile, which always
      // inserts a random number into the name. Rename it in-place (same cache
      // dir, so it stays under react-native-share's FileProvider config) to
      // get the clean invoiceType_customerName_billNo.pdf name.
      const rawPath = pdf.filePath.replace('file://', '');
      const desiredPath = `${RNFS.CachesDirectoryPath}/${buildPdfFileName() || 'invoice'}.pdf`;

      let finalPath = rawPath;
      if (rawPath !== desiredPath) {
        try {
          if (await RNFS.exists(desiredPath)) {
            await RNFS.unlink(desiredPath);
          }
          await RNFS.moveFile(rawPath, desiredPath);
          finalPath = desiredPath;
        } catch (renameError) {
          console.warn('PDF rename failed, using original path:', renameError);
        }
      }

      setPdfFilePath(finalPath);
      setPdfPreviewVisible(true);
    } catch (error) {
      console.error('PDF generation failed:', error);
      Alert.alert(t('common.error'), error?.message || t('invoicePreview.failedToGeneratePdf'));
    } finally {
      setPdfLoading(false);
    }
  };

  // ─── Fetch & Preview PDF ─────────────────────────────────
  const handlePrint = async () => {
    if (!invoiceData) return;

    const payload = { ...invoiceData, sign, amountInWords };

    setPdfLoading(true);
    console.log('the payload', payload);
    try {
      console.log('trying to reach print');
      const response = await fetch(
        'https://pdf-generator-backend-s90a.onrender.com/pdf/AES/product-invoice',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const base64Data = arrayBufferToBase64(arrayBuffer);

      // Save to cache for preview
      const filePath = `${RNFS.CachesDirectoryPath}/invoice_preview.pdf`;
      await RNFS.writeFile(filePath, base64Data, 'base64');

      setPdfBase64(base64Data);
      setPdfFilePath(filePath);
      setPdfPreviewVisible(true);
    } catch (error) {
      console.error('PDF generation failed:', error);
      Alert.alert(t('common.error'), t('invoicePreview.failedToGeneratePdfRetry'));
    } finally {
      setPdfLoading(false);
    }
  };

  // ─── Save / Download PDF ─────────────────────────────────
  const handleSavePdf = async () => {
    if (!pdfFilePath) {
      Alert.alert(t('common.error'), t('invoicePreview.pdfNotReady'));
      return;
    }

    setDownloading(true);
    try {
      const fileName = `${buildPdfFileName() || `invoice_${Date.now()}`}.pdf`;

      if (Platform.OS === 'android') {
        // Save to Downloads folder on Android
        const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.copyFile(pdfFilePath, destPath);
        Alert.alert(t('invoicePreview.savedTitle'), t('invoicePreview.savedMessage'));
      } else {
        // On iOS — use Share sheet to "Save to Files"
        await Share.open({
          title: 'Save Invoice',
          url: `file://${pdfFilePath}`,
          type: 'application/pdf',
          filename: fileName,
          saveToFiles: true, // iOS: shows "Save to Files" prominently
          failOnCancel: false,
        });
      }
    } catch (error) {
      if (error?.message !== 'User did not share') {
        console.error('Save failed:', error);
        Alert.alert(t('common.error'), t('invoicePreview.failedToSavePdf'));
      }
    } finally {
      setDownloading(false);
    }
  };

  // Helper: ArrayBuffer → Base64 string
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // const paymentModes = ['Cash', 'UPI', 'Card', 'Net Banking'];

  const openPaymentModal = () => {
    setSelectedPaymentMode(invoiceData?.paymentMode || 'Cash');
    setPaymentModalVisible(true);
  };

  const handleMarkAsPaid = async () => {
    try {
      setUpdatingPayment(true);
      const invoiceID = route?.params?.invoiceId;

      await invoiceService.updatePaymentStatus(
        invoiceID,
        'PAID',
        selectedPaymentMode,
      );

      await loadInvoice();
      setPaymentModalVisible(false);
      Alert.alert(t('common.success'), t('invoicePreview.paymentUpdated'));
    } catch (error) {
      console.error('Mark paid error:', error);
      Alert.alert(t('common.error'), t('invoicePreview.failedToUpdatePayment'));
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleShare = async () => {
    if (!pdfFilePath) {
      Alert.alert(t('common.error'), t('invoicePreview.pdfNotReady'));
      return;
    }

    try {
      console.log('Sharing PDF:', pdfFilePath);

      await Share.open({
        title: 'Share Invoice',
        message: `Invoice ${invoiceData?.billNo || ''}`,
        url: `file://${pdfFilePath}`,
        type: 'application/pdf',
        filename: `${buildPdfFileName() || 'invoice'}.pdf`,
        failOnCancel: false,
      });
    } catch (error) {
      if (error?.message !== 'User did not share') {
        console.error('Share failed:', error);

        Alert.alert(t('invoicePreview.shareFailedTitle'), t('invoicePreview.shareFailedMessage'));
      }
    }
  };

  const handleNativePrint = async () => {
    if (!pdfFilePath) {
      Alert.alert(t('common.error'), t('invoicePreview.pdfNotReadyShort'));
      return;
    }

    try {
      await RNPrint.print({
        filePath: pdfFilePath,
      });
    } catch (error) {
      console.error('Print failed:', error);

      Alert.alert(t('invoicePreview.printFailedTitle'), t('invoicePreview.printFailedMessage'));
    }
  };

  const dialCall = phoneNumber => {
    if (!phoneNumber) return;

    Linking.openURL(`tel:${phoneNumber}`).catch(err => {
      console.log(err);
      Alert.alert(t('common.error'), t('invoicePreview.unableToOpenDialer'));
    });
  };

  const customerPhone =
    invoiceData?.customer?.mobile || invoiceData?.customer?.phone || '';
  const items = invoiceData?.items || [];
  const isLabourInvoice = invoiceData?.invoiceType === 'LABOUR';

  const grandTotal =
    invoiceData?.items?.reduce(
      (total, item) =>
        total +
        (isLabourInvoice
          ? Number(item.amount || 0)
          : Number(item.qty || 0) * Number(item.unitPrice || 0)),
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
                <SkeletonLine
                  style={{ width: '50%', height: 16, marginTop: 6 }}
                />
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
              onPress={() => navigation.navigate('InvoiceList')}
              style={styles.iconBtn}
            >
              <ChevronLeft size={26} color="#111" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('invoicePreview.title')}</Text>
              <Text style={styles.subtitle}>{t('invoicePreview.companySubtitle')}</Text>
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
                <Text style={styles.companyName}>Aadhi Engine Care</Text>
                <Text style={styles.companyTag}>
                  KIRLOSKAR Spares for R/HA/R1040/SL90 Engines
                </Text>
              </View>

              <View style={styles.infoBlockRight}>
                <View style={styles.metaRow}>
                  <ReceiptText size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>
                    {t('invoicePreview.billNo')}{' '}
                    <Text style={styles.metaValue}>
                      {invoiceData?.billNo || '-'}
                    </Text>
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <CalendarDays size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>
                    {t('invoicePreview.date')} <Text style={styles.metaValue}>{invoiceDate}</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoBlock}>
                  <View style={styles.inlineRow}>
                    <MapPin size={14} color={COLORS.primary} />
                    <Text style={styles.infoText}>No. 5, Vetri Nagar</Text>
                  </View>
                  <Text style={styles.infoText}>
                    Vickramasingapuram - 627425
                  </Text>
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
                <Text style={styles.sectionTitle}>{t('invoicePreview.customerDetails')}</Text>
              </View>
              <View style={styles.customerBox}>
                <Text style={styles.customerLabel}>{t('invoicePreview.to')}</Text>
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
                      <PhoneCall
                        size={16}
                        color="#fff"
                        style={styles.callIcon}
                      />
                    </View>
                    <Text style={styles.callButtonText}>{customerPhone}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.noPhoneText}>
                    {t('invoicePreview.noPhoneAvailable')}
                  </Text>
                )}

                {invoiceData?.paymentStatus !== 'PENDING' && (
                  <View style={styles.paymentModeRow}>
                    <Text style={styles.paymentModeLabel}>{t('invoicePreview.paymentMode')}</Text>
                    <View style={styles.paymentModeValueRow}>
                      <View
                        style={[
                          styles.paymentModeBadge,
                          invoiceData?.paymentMode === 'Cash' &&
                            styles.badgeCash,
                          invoiceData?.paymentMode === 'UPI' &&
                            styles.badgeUpi,
                          invoiceData?.paymentMode === 'Card' &&
                            styles.badgeCard,
                          invoiceData?.paymentMode === 'Net Banking' &&
                            styles.badgeNetBanking,
                        ]}
                      >
                        <Text style={styles.paymentModeText}>
                          {invoiceData?.paymentMode
                            ? paymentModeLabels[invoiceData.paymentMode] || invoiceData.paymentMode
                            : '-'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={openPaymentModal}
                        hitSlop={8}
                        style={styles.paymentModeEditBtn}
                      >
                        <Pencil size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.tableHeader}>
                <Text style={styles.colSno}>{t('invoicePreview.sNo')}</Text>
                <Text style={styles.colDesc}>{t('invoicePreview.descriptionCol')}</Text>
                {!isLabourInvoice && <Text style={styles.colQty}>{t('invoicePreview.qty')}</Text>}
                {!isLabourInvoice && <Text style={styles.colPrice}>{t('invoicePreview.rate')}</Text>}
                <Text style={styles.colTotal}>{t('invoicePreview.amount')}</Text>
              </View>

              {items.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.colSnoData}>{index + 1}</Text>
                  <Text style={styles.colDescData}>
                    {item.description ?? item.name}
                  </Text>
                  {!isLabourInvoice && (
                    <Text style={styles.colQtyData}>{item.qty}</Text>
                  )}
                  {!isLabourInvoice && (
                    <Text style={styles.colPriceData}>
                      ₹{Number(item.unitPrice || 0).toFixed(2)}
                    </Text>
                  )}
                  <Text style={styles.colTotalData}>
                    ₹
                    {isLabourInvoice
                      ? Number(item.amount || 0).toFixed(2)
                      : (
                          Number(item.qty || 0) * Number(item.unitPrice || 0)
                        ).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('invoicePreview.total')}</Text>
                <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
              </View>

              <Text style={styles.wordsLabel}>{t('invoicePreview.amountInWords')}</Text>
              <Text style={styles.wordsText}>{amountInWords}</Text>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('invoicePreview.sign')}</Text>
              <Switch
                value={sign}
                onValueChange={setSign}
                trackColor={{ false: '#D1D5DB', true: '#22C55E' }}
                thumbColor={sign ? '#ffffff' : '#ffffff'}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
            <View style={styles.actionRow}>
              {invoiceData?.paymentStatus === 'PENDING' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={openPaymentModal}
                >
                  <ReceiptText size={18} color="#333" />
                  <Text style={styles.actionText}>{t('invoicePreview.markAsPaid')}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.previewPdfBtn}
                onPress={handlePreviewPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Printer size={18} color="#fff" />
                )}

                <Text style={styles.previewPdfText}>
                  {pdfLoading ? t('invoicePreview.generatingPdf') : t('invoicePreview.previewPdf')}
                </Text>
              </TouchableOpacity>
            </View>
            <Modal
              visible={paymentModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setPaymentModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>
                    {invoiceData?.paymentStatus === 'PENDING'
                      ? t('invoicePreview.selectPaymentMode')
                      : t('invoicePreview.updatePaymentMode')}
                  </Text>

                  {['Cash', 'UPI', 'Card', 'Net Banking'].map(mode => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.modeBtn,
                        selectedPaymentMode === mode && styles.modeBtnActive,
                      ]}
                      onPress={() => setSelectedPaymentMode(mode)}
                    >
                      <Text
                        style={[
                          styles.modeText,
                          selectedPaymentMode === mode && styles.modeTextActive,
                        ]}
                      >
                        {paymentModeLabels[mode]}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setPaymentModalVisible(false)}
                    >
                      <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalSaveBtn}
                      onPress={handleMarkAsPaid}
                      disabled={updatingPayment}
                    >
                      <Text style={styles.modalSaveText}>
                        {updatingPayment
                          ? t('invoicePreview.updating')
                          : invoiceData?.paymentStatus === 'PENDING'
                          ? t('invoicePreview.confirm')
                          : t('common.update')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              visible={pdfPreviewVisible}
              animationType="slide"
              onRequestClose={() => setPdfPreviewVisible(false)}
            >
              <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setPdfPreviewVisible(false)}
                    style={styles.modalCloseBtn}
                  >
                    <X size={22} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t('invoicePreview.invoicePdf')}</Text>
                  <View style={{ width: 40 }} />
                </View>

                {/* PDF Viewer */}
                <View style={{ flex: 1 }}>
                  {pdfLoading && (
                    <ActivityIndicator size="large" style={{ marginTop: 40 }} />
                  )}

                  {pdfFilePath && (
                    <Pdf
                      key={pdfFilePath}
                      source={{
                        uri:
                          Platform.OS === 'android'
                            ? `file://${pdfFilePath}`
                            : pdfFilePath,
                      }}
                      trustAllCerts={false}
                      style={styles.pdfViewer}
                      onLoadComplete={numberOfPages => {
                        console.log(`PDF loaded, pages: ${numberOfPages}`);
                      }}
                      onError={error => {
                        console.error('PDF render error:', error);
                        Alert.alert(t('common.error'), t('invoicePreview.couldNotRenderPdf'));
                      }}
                    />
                  )}
                </View>

                <View style={styles.pdfActionBar}>
                  <TouchableOpacity
                    style={styles.pdfShareBtn}
                    onPress={handleShare}
                    disabled={!pdfFilePath}
                  >
                    <Share2 size={20} color="#fff" />
                    <Text style={styles.pdfActionText}>{t('invoicePreview.share')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pdfPrintBtn}
                    onPress={handleSavePdf}
                    disabled={!pdfFilePath || downloading}
                  >
                    {downloading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Download size={20} color="#fff" />
                    )}
                    <Text style={styles.pdfActionText}>
                      {downloading ? t('invoicePreview.saving') : t('invoicePreview.download')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Modal>
            <Text style={styles.footerText}>
              Only genuine <Text style={styles.footerStrong}>KIRLOSKAR</Text>{' '}
              Spares and <Text style={styles.footerStrong}>K-OIL</Text> for your
              Kirloskar engine's lifelong care.
            </Text>
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
    fontFamily: 'Roboto',
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
    fontFamily: 'Roboto',
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E7ECF8',
    marginBottom: 5,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111',
  },
  modeBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  modeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  modeText: {
    fontSize: 15,
    color: '#222',
  },
  modeTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalSaveBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  modalCancelText: {
    fontWeight: '700',
    color: '#333',
  },
  modalSaveText: {
    fontWeight: '700',
    color: '#fff',
  },
  paymentModeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentModeLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  paymentModeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentModeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentModeEditBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  paymentModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  badgeCash: {
    backgroundColor: '#16A34A',
  },
  badgeUpi: {
    backgroundColor: '#7C3AED',
  },
  badgeCard: {
    backgroundColor: '#2563EB',
  },
  badgeNetBanking: {
    backgroundColor: '#F59E0B',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pdfViewer: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#eee',
  },

  previewPdfBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 2,
  },

  previewPdfText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  pdfActionBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  pdfShareBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  pdfPrintBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  pdfActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
