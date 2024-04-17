import { Button, Cascader, Input, InputNumber, Select } from "antd";
import Card from "@/components/Card";
import { useQuery } from "@tanstack/react-query";
import $axios from "@/utils/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import CustomSelect from "@/components/CustomSelect";

function Form() {
  // Form setup
  const formSchema = z.object({
    productSKU: z.string().min(1),
    productLink: z.string().url(),
    category: z.number(),
    subcategory: z.number(),
    features: z.record(z.number(), z.number().array().or(z.number())),
    labels: z.number().array(),
    useCases: z.number().array(),
    standard: z.number(),
    standardVersion: z.number(),
    technicalResult: z.number().array(),
  });
  type Form = z.infer<typeof formSchema>;
  const { control, handleSubmit, setValue, getValues, watch } = useForm<Form>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      features: {},
    },
  });

  // Fetch possible categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: (): Promise<
      {
        id: number;
        title: string;
        subcategories: {
          id: number;
          title: string;
          categoryId: number;
        }[];
      }[]
    > => $axios.get("/categories").then((res) => res.data),
  });

  // Fetch feature types for a subcategory
  const selectedSubcategoryId = watch("subcategory");
  const { data: featureTypes, isLoading: isLoadingFeatureTypes } = useQuery({
    queryKey: ["feature-types", selectedSubcategoryId],
    queryFn: (): Promise<
      {
        id: number;
        title: string;
        variant: "select" | "null";
        extra: string | null;
        possibleValues: { id: number; value: string }[];
      }[]
    > =>
      $axios
        .get(`/categories/subcategory/${selectedSubcategoryId}/features`)
        .then((res) => res.data),
    enabled: !!selectedSubcategoryId,
  });

  // Fetch labels types for a subcategory
  const { data: labels, isLoading: isLoadingLabels } = useQuery({
    queryKey: ["labels", selectedSubcategoryId],
    queryFn: (): Promise<
      {
        id: number;
        title: string;
      }[]
    > =>
      $axios
        .get(`/categories/subcategory/${selectedSubcategoryId}/labels`)
        .then((res) => res.data),
    enabled: !!selectedSubcategoryId,
  });

  // Fetch use cases types for a subcategory
  const { data: useCases, isLoading: isLoadingUseCases } = useQuery({
    queryKey: ["use-cases", selectedSubcategoryId],
    queryFn: (): Promise<
      {
        id: number;
        title: string;
      }[]
    > =>
      $axios
        .get(`/categories/subcategory/${selectedSubcategoryId}/use-cases`)
        .then((res) => res.data),
    enabled: !!selectedSubcategoryId,
  });

  // Fetch standards for a subcategory
  const { data: standards, isLoading: isLoadingStandards } = useQuery({
    queryKey: ["standards", selectedSubcategoryId],
    queryFn: (): Promise<
      {
        id: number;
        title: string;
        versions: {
          id: number;
          title: string;
          technicalResults: { id: number; title: string }[];
        }[];
      }[]
    > =>
      $axios
        .get(`/categories/subcategory/${selectedSubcategoryId}/standards`)
        .then((res) => res.data),
    enabled: !!selectedSubcategoryId,
  });

  // Loaders
  if (isLoadingCategories) {
    return <p>Loading...</p>;
  }

  return (
    <form
      className="flex items-start gap-8"
      onSubmit={handleSubmit((data) => console.log(data))}
    >
      <div className="flex w-1/2 flex-col gap-8">
        <Card>
          <h1 className="font-semibold">Product Edit</h1>

          <Controller
            control={control}
            name="productSKU"
            render={({ field, fieldState: { error } }) => (
              <div className="mt-4 flex flex-col gap-1">
                <label>Product SKU</label>
                <Input
                  placeholder="Product SKU"
                  {...field}
                  status={error && "error"}
                />
                {error && (
                  <p className="text-xs text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            control={control}
            name="productLink"
            render={({ field, fieldState: { error } }) => (
              <div className="mt-2 flex flex-col gap-1">
                <label>Product Link</label>
                <Input
                  placeholder="Product Link"
                  {...field}
                  status={error && "error"}
                />
                {error && (
                  <p className="text-xs text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
        </Card>

        <Button htmlType="submit">Submit</Button>
      </div>
      <div className="flex w-1/2 flex-col gap-8">
        <Card>
          <h1 className="font-semibold">Product attributes & suitability</h1>

          <Controller
            control={control}
            name="subcategory"
            render={({ fieldState: { error } }) => (
              <div className="mt-4 flex flex-col gap-1">
                <p>Category</p>
                {categories ? (
                  <Cascader
                    placeholder="Select a category"
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.title,
                      children: c.subcategories.map((sc) => ({
                        value: sc.id,
                        label: sc.title,
                      })),
                    }))}
                    expandTrigger="hover"
                    allowClear={false}
                    style={{ width: 250 }}
                    multiple={false}
                    onChange={(val) => {
                      setValue("category", val[0] as number);
                      setValue("subcategory", val[1] as number);
                    }}
                    status={error && "error"}
                  />
                ) : (
                  <p>No categories!</p>
                )}
                {error && (
                  <p className="text-xs text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />

          {!!selectedSubcategoryId && (
            <>
              {(isLoadingFeatureTypes ||
                isLoadingLabels ||
                isLoadingUseCases ||
                isLoadingStandards) && <p>Loading...</p>}
              {!featureTypes && !isLoadingFeatureTypes && (
                <p>Error fetching the feature types</p>
              )}
              {!labels && !isLoadingLabels && <p>Error fetching the labels</p>}
              {!useCases && !isLoadingUseCases && (
                <p>Error fetching the use cases</p>
              )}
              {!standards && !isLoadingStandards && (
                <p>Error fetching the standards</p>
              )}
              {featureTypes && !isLoadingFeatureTypes && (
                <div className="mt-6">
                  {/* Headings */}
                  <div className="grid grid-cols-2 border-b border-b-gray-300 py-2">
                    <p className="font-bold">Feature types</p>
                    <p className="font-bold">Value</p>
                  </div>
                  {/* Features */}
                  {featureTypes.map((f) => (
                    <div
                      className="grid grid-cols-2 items-center border-b border-b-gray-300 py-2"
                      key={f.id}
                    >
                      <p>{f.title}</p>
                      {f.variant == "select" ? (
                        <CustomSelect
                          initialOptions={f.possibleValues.map((v) => ({
                            label: v.value,
                            value: v.id,
                          }))}
                          value={watch("features")[f.id] as number[]}
                          setValue={(val) =>
                            setValue("features", {
                              ...getValues("features"),
                              [f.id]: val,
                            })
                          }
                          addKey={["add-feature-value", f.id.toString()]}
                          addUrl={`/product-features/${f.id}/values`}
                          addPostValueKey="value"
                        />
                      ) : (
                        <InputNumber
                          addonAfter={f.extra}
                          value={watch("features")[f.id] as number}
                          onChange={(val) => {
                            if (!val) {
                              const { [f.id]: _cur, ...newValues } =
                                getValues("features");
                              setValue("features", newValues);
                              return;
                            }
                            setValue("features", {
                              ...getValues("features"),
                              [f.id]: val as number,
                            });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
        {!isLoadingStandards && !!standards && (
          <Card>
            <h1 className="font-semibold">Standards</h1>
            <div className="mt-4">
              <p className="mb-1">Standard</p>
              {labels ? (
                <>
                  <Select
                    placeholder="Select an standard"
                    options={standards.map((s) => ({
                      label: s.title,
                      value: s.id,
                    }))}
                    value={watch("standard")}
                    onChange={(val) => {
                      setValue("standard", val);
                      // TODO: Reset the value of standardVersion
                      // setValue("standardVersion", undefined);
                    }}
                    style={{ width: 250 }}
                  />
                </>
              ) : (
                <p>Could not fetch standards</p>
              )}
            </div>
            {!!watch("standard") && (
              <div className="mt-4">
                <p className="mb-1">Standard Version</p>
                <Select
                  placeholder="Select an standard version"
                  options={standards
                    .find((s) => s.id == watch("standard"))
                    ?.versions.map((v) => ({
                      label: v.title,
                      value: v.id,
                    }))}
                  value={watch("standardVersion")}
                  onChange={(val) => setValue("standardVersion", val)}
                  style={{ width: 250 }}
                />
              </div>
            )}
            {watch("standardVersion") && (
              <Controller
                control={control}
                name="technicalResult"
                render={({ fieldState: { error } }) => (
                  <div className="mt-4">
                    <p className="mb-1">Techincal Results</p>
                    <CustomSelect
                      initialOptions={
                        standards
                          .find((s) => s.id == watch("standard"))
                          ?.versions.find(
                            (v) => v.id == watch("standardVersion"),
                          )
                          ?.technicalResults.map((r) => ({
                            label: r.title,
                            value: r.id,
                          })) || []
                      }
                      value={watch("technicalResult")}
                      setValue={(val) => setValue("technicalResult", val)}
                      addKey={[
                        "add-technical-result",
                        watch("standardVersion").toString(),
                      ]}
                      addUrl={`/standards/version/${getValues("standardVersion")}/technical-results`}
                      addPostValueKey="technicalResult"
                      style={{ width: 250 }}
                    />
                    {error && (
                      <p className="text-xs text-red-500">{error.message}</p>
                    )}
                  </div>
                )}
              />
            )}
          </Card>
        )}
        {!isLoadingLabels && !!labels && !isLoadingUseCases && !!useCases && (
          <Card>
            <h1 className="font-semibold">Labels & Use Cases</h1>
            <Controller
              control={control}
              name="labels"
              render={({ fieldState: { error } }) => (
                <div className="mt-4">
                  <p className="mb-1">Labels</p>
                  {labels ? (
                    <CustomSelect
                      initialOptions={labels.map((l) => ({
                        label: l.title,
                        value: l.id,
                      }))}
                      value={watch("labels")}
                      setValue={(val) => setValue("labels", val)}
                      addKey={["add-label", selectedSubcategoryId.toString()]}
                      addUrl={`/product-labels/subcategory/${selectedSubcategoryId}`}
                      addPostValueKey="label"
                      style={{ width: 250 }}
                    />
                  ) : (
                    <p>Could not fetch labels</p>
                  )}
                  {error && (
                    <p className="text-xs text-red-500">{error.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name="useCases"
              render={({ fieldState: { error } }) => (
                <div className="mt-4">
                  <p className="mb-1">Use Cases</p>
                  {useCases ? (
                    <CustomSelect
                      initialOptions={useCases.map((l) => ({
                        label: l.title,
                        value: l.id,
                      }))}
                      value={watch("useCases")}
                      setValue={(val) => setValue("useCases", val)}
                      addKey={[
                        "add-use-cases",
                        selectedSubcategoryId.toString(),
                      ]}
                      addUrl={`/product-use-cases/subcategory/${selectedSubcategoryId}`}
                      addPostValueKey="useCase"
                      style={{ width: 250 }}
                    />
                  ) : (
                    <p>Could not fetch use cases!</p>
                  )}
                  {error && (
                    <p className="text-xs text-red-500">{error.message}</p>
                  )}
                </div>
              )}
            />
          </Card>
        )}
      </div>
    </form>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-[#F7F8F7]">
      <div className="container p-8">
        <Form />
      </div>
    </main>
  );
}
