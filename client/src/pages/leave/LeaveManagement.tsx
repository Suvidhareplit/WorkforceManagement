import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings, FileText, History } from "lucide-react";

export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState("config");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management System</h1>
        <p className="text-slate-600 mt-1">Configure leaves, policies, holidays, and track all changes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Leave Config
          </TabsTrigger>
          <TabsTrigger value="policy">
            <FileText className="h-4 w-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="holiday">
            <Calendar className="h-4 w-4 mr-2" />
            Holidays
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Leave Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-lg text-slate-600">
                  Leave Management System is ready!
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  ✅ Database created with 7 tables<br />
                  ✅ Backend API with 13 endpoints<br />
                  ✅ RH allocations configured<br />
                  ✅ Audit trail system active<br />
                  ⏳ Full UI implementation in progress
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle>Leave Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-slate-600">
                Policy management UI coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holiday">
          <Card>
            <CardHeader>
              <CardTitle>Holidays</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-slate-600">
                Holiday management UI coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-slate-600">
                Audit trail UI coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
