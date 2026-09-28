// In React Navigation 7, `navigate()` pushes a new copy of a screen even when
// it is already in the stack. These helpers go back to existing screens instead,
// so the hardware back button never walks through duplicate screens.

export const goBackOrHome = navigation => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  }
};

// Goes back to an existing screen with that name, or opens it if it isn't in the stack.
export const navigateBackTo = (navigation, name, params) =>
  navigation.navigate(name, params, { pop: true });

// After an invoice is deleted from its edit form, remove both the form and the
// (now stale) preview underneath it.
export const leaveDeletedInvoice = navigation => {
  const { routes, index } = navigation.getState();
  const previewIndex = routes.findLastIndex(r => r.name === 'previewInvoice');

  if (previewIndex > 0) {
    navigation.pop(index - previewIndex + 1);
  } else {
    goBackOrHome(navigation);
  }
};

// Clears the whole history so back cannot return to screens behind the login.
export const resetTo = (navigation, name) =>
  navigation.reset({ index: 0, routes: [{ name }] });
