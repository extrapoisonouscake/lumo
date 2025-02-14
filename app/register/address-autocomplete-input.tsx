import { FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AllowedRegistrationCountries } from "@/lib/auth/public";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
const FORM_FIELD_NAME = "fields.address";
const countrySpecificPlaceholder: Record<AllowedRegistrationCountries, string> =
  {
    [AllowedRegistrationCountries.Canada]: "855 Davie St",
    [AllowedRegistrationCountries.US]: "173 16th Ave",
  };
export function AddressAutocompleteInput({
  country,
}: {
  country: AllowedRegistrationCountries;
}) {
  const form = useFormContext();
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ["address_components", "name", "formatted_address"],
      componentRestrictions: { country },
      types: ["address"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places, country]);
  const onPlaceSelect = ({
    address_components,
    name,
  }: google.maps.places.PlaceResult) => {
    form.setValue(FORM_FIELD_NAME, name);
    let city, region, postalCode;
    if (!address_components) return;
    for (const component of address_components) {
      const { types, short_name } = component;
      if (types.includes("postal_code")) {
        postalCode = short_name;
      } else if (types.includes("administrative_area_level_1")) {
        region = short_name;
      } else if (types.includes("locality")) {
        city = short_name;
      }
    }
    form.setValue("fields.city", city);
    form.setValue("fields.region", region);
    form.setValue("fields.postalCode", postalCode);
  };
  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);
  return (
    <Controller
      control={form.control}
      name={FORM_FIELD_NAME}
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel required>Address</FormLabel>
          <Input
            required
            value={value}
            autoComplete="address-line1"
            placeholder={countrySpecificPlaceholder[country]}
            onChange={onChange}
            {...field}
            ref={inputRef}
          />
        </FormItem>
      )}
    />
  );
}
