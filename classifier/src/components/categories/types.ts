export interface SubtypeData {
	id: string;
	type: string;
	description: string;
	encompassFolder: string;
	sortOrder: number;
}

export interface CategoryData {
	id: string;
	name: string;
	description: string;
	sortOrder: number;
	subtypes: SubtypeData[];
}

export interface SubtypeFieldValues {
	description: string;
	encompassFolder: string;
	id?: string;
	sortOrder: number;
	type: string;
}

export interface EditorFormValues {
	description: string;
	name: string;
	sortOrder: number;
	subtypes: SubtypeFieldValues[];
}
