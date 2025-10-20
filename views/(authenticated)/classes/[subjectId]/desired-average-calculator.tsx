"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Assignment, AssignmentStatus, SubjectSummary } from "@/types/school";
import {
  Calculator01StrokeRounded,
  Target01StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";

export function DesiredAverageCalculator({
  assignments,
  categories,
  currentAverage,
}: {
  assignments: Assignment[];
  categories: SubjectSummary["academics"]["categories"];
  currentAverage: SubjectSummary["academics"]["running"]["overall"];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]!.id
  );
  const [desiredAverage, setDesiredAverage] = useState<string>("");
  const [minimumScore, setMinimumScore] = useState<string>("80");

  const calculation = useMemo(() => {
    if (!desiredAverage || !minimumScore) return null;

    const desiredAvg = parseFloat(desiredAverage);
    const minScore = parseFloat(minimumScore);

    if (
      isNaN(desiredAvg) ||
      isNaN(minScore) ||
      desiredAvg < 0 ||
      desiredAvg > 100 ||
      minScore < 0 ||
      minScore > 100
    ) {
      return null;
    }

    // Get ALL graded assignments for weight calculations
    const allGradedAssignments = assignments.filter(
      (assignment) => assignment.status === AssignmentStatus.Graded
    );

    if (allGradedAssignments.length === 0) {
      return 0;
    }
    const category = categories.find((cat) => cat.id === selectedCategoryId)!;
    let wCategory = (category.derivedWeight ?? 0) / 100;
    let currentCategoryFraction = (category.average?.mark ?? 0) / 100;
    let thresholdFraction = minScore / 100;

    // Current contribution to total grade from this category
    let currentContribution = wCategory * currentCategoryFraction;

    // Contribution needed from this category to reach desired overall average
    let desiredContribution = desiredAvg / 100;
    let remainingContribution =
      desiredContribution -
      ((currentAverage?.mark ?? 0) / 100 - currentContribution);

    if (remainingContribution <= 0) return 0; // Already enough
    console.log({
      remainingContribution,
      wCategory,
      currentCategoryFraction,
      thresholdFraction,
    });
    if (thresholdFraction <= currentCategoryFraction) return Infinity; // Impossible if threshold <= current score in category

    // The fraction of the category weight needed from future assignments
    let fractionNeeded = remainingContribution / wCategory;
    console.log(fractionNeeded, thresholdFraction, currentCategoryFraction);
    // Approximate number of future assignments needed at threshold score
    let n = fractionNeeded / (thresholdFraction - currentCategoryFraction);

    return Math.ceil(n);
  }, [
    assignments,
    categories,
    currentAverage,
    selectedCategoryId,
    desiredAverage,
    minimumScore,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Calculator01StrokeRounded} className="size-5" />
          Desired Average Calculator
        </CardTitle>
        <CardDescription>
          Calculate how many assignments you need to score above a certain
          percentage with a specific weight to reach your desired overall
          average. Assumes unlimited future assignments are available.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category-select">Weight Source Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} (
                    {category.derivedWeight
                      ? `${category.derivedWeight}%`
                      : "No weight"}
                    )
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired-average">
              Desired Overall Average (out of 100)
            </Label>
            <Input
              id="desired-average"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={desiredAverage}
              onChange={(e) => setDesiredAverage(e.target.value)}
              placeholder="e.g., 85"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum-score">Minimum Score (%)</Label>
            <Input
              id="minimum-score"
              type="number"
              min="0"
              max="100"
              step="1"
              value={minimumScore}
              onChange={(e) => setMinimumScore(e.target.value)}
              placeholder="e.g., 80"
            />
          </div>

          <div className="space-y-2">
            <Label>Current Overall Average</Label>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <HugeiconsIcon
                icon={Target01StrokeRounded}
                className="size-4 text-muted-foreground"
              />
              <span className="font-medium">
                {currentAverage?.mark?.toFixed(1) || 0}/100
              </span>
            </div>
          </div>
        </div>

        {calculation && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Calculation Results</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Overall Average:</span>
                <span className="font-medium">
                  {currentAverage?.mark?.toFixed(1) || 0}/100
                </span>
              </div>

              <div className="flex justify-between">
                <span>Assignments needed above {minimumScore}%:</span>
                <span className="font-medium text-green-600">
                  {calculation}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
