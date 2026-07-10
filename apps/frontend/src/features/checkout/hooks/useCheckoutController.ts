import { useCheckoutForm } from './useCheckoutForm';
import { useCheckoutMutation } from './useCheckoutMutation';

export function useCheckoutController() {
  const checkoutForm = useCheckoutForm();

  const mutation = useCheckoutMutation();

  async function submit() {
    await mutation.mutateAsync(checkoutForm.getValues());
  }

  return {
    checkoutForm,

    submit,

    loading: mutation.isPending,

    addresses: checkoutForm.addresses,
    selectedAddressId: checkoutForm.selectedAddressId,
    setSelectedAddressId: checkoutForm.setSelectedAddressId,

    deleteAddress: checkoutForm.deleteAddress,
    setFavorite: checkoutForm.setFavorite,

    handleAddressChange: checkoutForm.handleAddressChange,

    isLogged: checkoutForm.isLogged,
    setIsLogged: checkoutForm.setIsLogged,

    showLogin: checkoutForm.showLogin,
    setShowLogin: checkoutForm.setShowLogin,

    isValid: checkoutForm.isValid,
    reset: checkoutForm.reset,
    setValue: checkoutForm.setValue,
    watch: checkoutForm.watch,
  };
}
