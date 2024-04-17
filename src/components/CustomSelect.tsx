import { Divider, Input, InputRef, Select, SelectProps, Spin } from "antd";
import { useRef, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import $axios from "@/utils/axios";

export default function CustomSelect<T>({
  initialOptions,
  value,
  setValue,
  addKey,
  addUrl,
  addPostValueKey,
  style,
}: {
  initialOptions: NonNullable<SelectProps["options"]>;
  value: T[];
  setValue: (val: T[]) => void;
  addKey: string[];
  addUrl: string;
  addPostValueKey: string;
  style?: SelectProps["style"];
}) {
  const newItemInputRef = useRef<InputRef>(null);
  const [newItem, setNewItem] = useState("");

  const [options, setOptions] = useState(initialOptions);

  const { mutateAsync: addFn, isPending: isAdding } = useMutation({
    mutationKey: addKey,
    mutationFn: () =>
      $axios
        .post(addUrl, {
          [addPostValueKey]: newItem,
        })
        .then((res) => res.data),
  });

  return (
    <Select
      placeholder="Select value"
      options={options}
      mode="multiple"
      allowClear
      value={value}
      onChange={(v) => setValue(v)}
      style={style}
      dropdownRender={(menu) => (
        <>
          <div className="relative p-2">
            {isAdding && (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />}
                className="absolute right-4 top-3"
              />
            )}
            <Input
              placeholder="+ Add an item"
              ref={newItemInputRef}
              value={newItem}
              disabled={isAdding}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={async (e) => {
                e.stopPropagation();
                if (e.key == "Enter") {
                  if (newItem.trim() == "") {
                    return;
                  }

                  const res = await addFn();
                  setOptions([...options, res]);
                  setNewItem("");
                  setValue([...(value || []), res.value]);
                  setTimeout(() => {
                    newItemInputRef.current?.focus();
                  }, 0);
                }
              }}
            />
          </div>
          <Divider style={{ margin: "8px 0" }} />
          {menu}
        </>
      )}
    />
  );
}
