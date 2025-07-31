function EditableProperty({ index, property, onChange }) {
  return (
    <div className="flex gap-4 items-center">
      <input
        type="text"
        placeholder="Property Lang ID"
        value={property.id}
        onChange={e => onChange(index, 'id', e.target.value)}
        className="border p-2 w-1/2"
      />
      <select
        value={property.type}
        onChange={e => onChange(index, 'type', e.target.value)}
        className="border p-2 w-1/2"
      >
        <option value="0">Text Field</option>
        <option value="1">File Picker</option>
      </select>
    </div>
  );
}

export default EditableProperty;