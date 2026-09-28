import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { useTranslation } from '../localization/LanguageContext';

// Asks before leaving a screen that has unsaved changes. Covers the header back
// button, the Android hardware back button and the iOS swipe gesture.
// Call the returned `allowLeave()` right before navigating away after a save.
export default function useUnsavedChangesGuard(hasUnsavedChanges) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const allowLeaveRef = useRef(false);

  usePreventRemove(hasUnsavedChanges, ({ data }) => {
    if (allowLeaveRef.current) {
      navigation.dispatch(data.action);
      return;
    }

    Alert.alert(
      t('createCustomer.discardTitle'),
      t('createCustomer.discardMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('createCustomer.discard'),
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
  });

  return useCallback(() => {
    allowLeaveRef.current = true;
  }, []);
}
