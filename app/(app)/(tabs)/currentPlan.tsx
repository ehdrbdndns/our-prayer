import { usePlanListQuery } from "@/utils/queries";
import { Redirect } from "expo-router";

export default function PlanDetail() {
  // get the currnet plan id
  // fetch Plan data
  const { data: plan, isLoading: isPlanLoading, isSuccess: isPlanSuccess } = usePlanListQuery();

  const currentPlan = plan?.currentPlan
    ? plan.plans.filter((row) => row.plan_id === plan.currentPlan?.plan_id)[0]
    : null;

  if (isPlanLoading) {
    return null;
  }

  if (!isPlanSuccess) {
    return <Redirect href="/plan" />;
  }

  // Redirect to the stack lecture
  return (isPlanSuccess && currentPlan)
    ? <Redirect href={`/planDetail/${currentPlan.plan_id}`} />
    : <Redirect href="/plan" />;
}