import { router } from "expo-router";
import {
	View,
	ScrollView,
	TouchableOpacity,
	Pressable,
	Modal,
	TextInput,
} from "react-native";
import { Plus, Check, Users } from "lucide-react-native";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

// You'll need to create these types based on your Supabase schema
type Habit = {
	id: string;
	name: string;
	is_group_habit: boolean;
	completed_users: number;
	total_users: number;
	is_completed_by_me: boolean;
};

// Temporary mock data - replace with Supabase query
const mockHabits: Habit[] = [
	{
		id: "1",
		name: "Morning Meditation",
		is_group_habit: false,
		completed_users: 1,
		total_users: 1,
		is_completed_by_me: false,
	},
	{
		id: "2",
		name: "Group Workout",
		is_group_habit: true,
		completed_users: 2,
		total_users: 4,
		is_completed_by_me: false,
	},
];

export default function Home() {
	const [completedHabits, setCompletedHabits] = useState<
		Record<string, boolean>
	>({});
	const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
	const [completedUsersCount, setCompletedUsersCount] = useState<
		Record<string, number>
	>({});
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [newHabitName, setNewHabitName] = useState("");
	const [habits, setHabits] = useState<Habit[]>(mockHabits);

	// Initialize both completed states and completed users count
	useEffect(() => {
		const initialCompletedState = habits.reduce(
			(acc, habit) => ({
				...acc,
				[habit.id]: Boolean(habit.is_completed_by_me),
			}),
			{},
		);

		const initialCompletedUsersCount = habits.reduce(
			(acc, habit) => ({
				...acc,
				[habit.id]: habit.completed_users || 0,
			}),
			{},
		);

		setCompletedHabits(initialCompletedState);
		setCompletedUsersCount(initialCompletedUsersCount);
	}, [habits]);

	const handleAddHabit = () => {
		if (newHabitName.trim()) {
			// Create the new habit object
			const newHabit: Habit = {
				id: Date.now().toString(),
				name: newHabitName.trim(),
				is_completed_by_me: false,
				is_group_habit: false,
				completed_users: 0,
				total_users: 1,
			};

			// Update the habits list with the new habit
			setHabits((prevHabits) => [...prevHabits, newHabit]);

			// Update the completedHabits state to include the new habit
			setCompletedHabits((prev) => ({
				...prev,
				[newHabit.id]: false,
			}));

			// Reset form and close modal
			setNewHabitName("");
			setIsModalVisible(false);

			// TODO: Add API call to create new habit
			// try {
			//   await createHabitInDatabase(newHabit);
			// } catch (error) {
			//   console.error('Failed to create habit:', error);
			//   // Optionally remove the habit if API call fails
			//   setHabits(prevHabits => prevHabits.filter(h => h.id !== newHabit.id));
			// }
		}
	};

	return (
		<View className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center p-4 pt-12 border-b border-border">
				<Text className="text-xl font-bold">HabitTracker</Text>
				<Pressable
					onPress={() => setIsModalVisible(true)}
					className="p-2 bg-primary rounded-full"
				>
					<Plus size={24} />
				</Pressable>
			</View>

			{/* Add Habit Modal */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={isModalVisible}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View className="flex-1 justify-center bg-black/50">
					<View className="mx-4 rounded-lg bg-white p-6">
						<Text className="mb-4 text-xl font-bold text-black">
							Create New Habit
						</Text>

						<TextInput
							className="mb-4 rounded-md border border-gray-300 p-3 text-black text-base"
							placeholder="Enter habit name"
							placeholderTextColor="#665"
							value={newHabitName}
							onChangeText={setNewHabitName}
						/>

						<View className="flex-row justify-end space-x-3 gap-3">
							<Pressable
								className="rounded-md bg-gray-200 px-4 py-3"
								onPress={() => {
									setNewHabitName("");
									setIsModalVisible(false);
								}}
							>
								<Text className="text-black text-base font-medium">Cancel</Text>
							</Pressable>

							<Pressable
								className="rounded-md bg-blue-500 px-4 py-3"
								onPress={handleAddHabit}
							>
								<Text className="text-white text-base font-medium">
									Create Habit
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Habits List */}
			<ScrollView className="flex-1 p-4">
				{habits.map((habit) => (
					<View
						key={habit.id}
						className="bg-card p-4 rounded-lg mb-4 border border-border"
					>
						<View className="flex-row justify-between items-center">
							<View>
								<Text className="text-lg font-semibold">{habit.name}</Text>
								{habit.is_group_habit && (
									<View className="flex-row items-center mt-1">
										<Users size={16} />
										<Text className="text-sm text-muted-foreground ml-1">
											{habit.completed_users}/{habit.total_users} completed
										</Text>
									</View>
								)}
							</View>

							<Pressable
								className={`flex-row items-center justify-center rounded-md px-3 py-2 ${
									completedHabits[habit.id] ? "bg-green-500" : "bg-gray-500"
								} ${isLoading[habit.id] ? "opacity-50" : "opacity-100"}`}
								disabled={isLoading[habit.id]}
								onPress={async () => {
									const newCompletedState = !completedHabits[habit.id];
									console.log(
										"Toggling habit:",
										habit.id,
										"to:",
										newCompletedState,
									);

									try {
										setIsLoading((prev) => ({
											...prev,
											[habit.id]: true,
										}));

										// Update the completion state
										setCompletedHabits((prev) => ({
											...prev,
											[habit.id]: newCompletedState,
										}));

										// Update completed users count for group habits
										if (habit.is_group_habit) {
											setCompletedUsersCount((prev) => ({
												...prev,
												[habit.id]:
													prev[habit.id] + (newCompletedState ? 1 : -1),
											}));

											// Update the habit's completed_users property
											habit.completed_users =
												(habit.completed_users || 0) +
												(newCompletedState ? 1 : -1);
										}

										// Update the original property
										habit.is_completed_by_me = newCompletedState;

										// TODO: Add your API call here
										// await updateHabitCompletion(habit.id, newCompletedState);

										console.log("Updated habit state:", {
											completed: newCompletedState,
											completedUsers: habit.is_group_habit
												? completedUsersCount[habit.id]
												: null,
										});
									} catch (error) {
										// Revert all states if there's an error
										setCompletedHabits((prev) => ({
											...prev,
											[habit.id]: !newCompletedState,
										}));

										if (habit.is_group_habit) {
											setCompletedUsersCount((prev) => ({
												...prev,
												[habit.id]:
													prev[habit.id] + (newCompletedState ? -1 : 1),
											}));
											habit.completed_users =
												(habit.completed_users || 0) +
												(newCompletedState ? -1 : 1);
										}

										habit.is_completed_by_me = !newCompletedState;
										console.error("Error updating habit:", error);
									} finally {
										setIsLoading((prev) => ({
											...prev,
											[habit.id]: false,
										}));
									}
								}}
							>
								<Check size={16} color="white" />
								<Text className="ml-2 text-white">
									{completedHabits[habit.id] ? "Completed" : "Mark Done"}
								</Text>
							</Pressable>
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
}
