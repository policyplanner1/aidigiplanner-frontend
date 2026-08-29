import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { GLASS_SX } from "../../../constants/layout";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type {
  ApiSubProductPublic,
  ApprovalPolicy,
  BrandingMode,
  CompanyBrandProfile,
  SubProductBrandingMode,
} from "../../../types/onboarding";
import {
  useDeleteSubProduct,
  usePatchProduct,
  usePatchSubProduct,
} from "../hooks/useCompanyProjects";

const POLICIES: { id: ApprovalPolicy; label: string }[] = [
  { id: "no_approval", label: "No approval" },
  { id: "one_approver", label: "One approver" },
  { id: "product_manager_approval", label: "Product manager approval" },
  { id: "company_admin_approval", label: "Company admin approval" },
];

function emptySubBrand(name: string): CompanyBrandProfile {
  return {
    name,
    category: "General",
    market: "India",
    audience_primary: "",
    website_url: "",
    compliance_mandatory_disclaimer: "",
  };
}

export function ProductSettingsPanel({
  companyId,
  productId,
  name,
  description,
  live,
  subProducts,
}: {
  companyId: string;
  productId: string;
  name: string;
  description: string;
  live: boolean;
  subProducts: ApiSubProductPublic[];
}) {
  const patchProduct = usePatchProduct(companyId);
  const patchSub = usePatchSubProduct(productId);
  const deleteSub = useDeleteSubProduct(productId);

  const [productName, setProductName] = useState(name);
  const [productDescription, setProductDescription] = useState(description);
  const [brandingMode, setBrandingMode] = useState<BrandingMode>("separate_brand");
  const [approvalPolicy, setApprovalPolicy] = useState<ApprovalPolicy>("no_approval");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<ApiSubProductPublic | null>(null);
  const [subName, setSubName] = useState("");
  const [subMode, setSubMode] = useState<SubProductBrandingMode>("use_product_branding");
  const [brandOpen, setBrandOpen] = useState<ApiSubProductPublic | null>(null);
  const [subBrand, setSubBrand] = useState<CompanyBrandProfile>(emptySubBrand(""));
  const [brandBusy, setBrandBusy] = useState(false);

  useEffect(() => {
    setProductName(name);
    setProductDescription(description);
  }, [description, name]);

  const saveProduct = async () => {
    setError(null);
    setNotice(null);
    try {
      await patchProduct.mutateAsync({
        productId,
        name: productName.trim(),
        description: productDescription.trim() || null,
        branding_mode: brandingMode,
        approval_policy: approvalPolicy,
      });
      setNotice("Product settings saved.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const openSub = (item: ApiSubProductPublic) => {
    setEditingSub(item);
    setSubName(item.name);
    setSubMode((item.branding_mode as SubProductBrandingMode) || "use_product_branding");
  };

  const saveSub = async () => {
    if (!editingSub) return;
    setError(null);
    try {
      await patchSub.mutateAsync({
        subProductId: editingSub.id,
        name: subName.trim(),
        branding_mode: subMode,
      });
      setEditingSub(null);
      setNotice("Sub-product updated.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const removeSub = async (item: ApiSubProductPublic) => {
    setError(null);
    try {
      await deleteSub.mutateAsync(item.id);
      setNotice(`${item.name} deleted.`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const openBrand = async (item: ApiSubProductPublic) => {
    setBrandOpen(item);
    setBrandBusy(true);
    setError(null);
    try {
      const { data } = await onboardingApi.getEffectiveSubProductBrand(item.id);
      setSubBrand({ ...emptySubBrand(item.name), ...data, name: data.name || item.name });
    } catch {
      try {
        const { data } = await onboardingApi.getSubProductBrandProfile(item.id);
        setSubBrand({ ...emptySubBrand(item.name), ...data, name: data.name || item.name });
      } catch {
        setSubBrand(emptySubBrand(item.name));
      }
    } finally {
      setBrandBusy(false);
    }
  };

  const saveBrand = async () => {
    if (!brandOpen) return;
    setBrandBusy(true);
    setError(null);
    try {
      await onboardingApi.saveSubProductBrandProfile(brandOpen.id, {
        ...subBrand,
        name: subBrand.name || brandOpen.name,
        category: subBrand.category || "General",
        market: subBrand.market || "India",
        audience_primary: subBrand.audience_primary || "Customers",
        compliance_mandatory_disclaimer: subBrand.compliance_mandatory_disclaimer ?? "",
      });
      setBrandOpen(null);
      setNotice("Sub-product brand saved.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBrandBusy(false);
    }
  };

  if (!live) return null;

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ ...GLASS_SX, p: { xs: 2.25, md: 3 }, borderRadius: 1, display: "grid", gap: 1.5 }}>
        <Typography sx={{ fontWeight: 800 }}>Product settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Rename, change branding mode, or set who must approve content after create.
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {notice ? <Alert severity="success">{notice}</Alert> : null}
        <TextField
          label="Product name"
          fullWidth
          placeholder="Policy Planner"
          value={productName}
          onChange={(event) => setProductName(event.target.value)}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          minRows={2}
          placeholder="Family health cover with cashless hospitalisation."
          value={productDescription}
          onChange={(event) => setProductDescription(event.target.value)}
        />
        <TextField
          select
          fullWidth
          label="Branding mode"
          value={brandingMode}
          onChange={(event) => setBrandingMode(event.target.value as BrandingMode)}
        >
          <MenuItem value="use_company_branding">Use company branding</MenuItem>
          <MenuItem value="separate_brand">Separate brand</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          label="Approval policy"
          value={approvalPolicy}
          onChange={(event) => setApprovalPolicy(event.target.value as ApprovalPolicy)}
        >
          {POLICIES.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        <Box>
          <Button variant="contained" disabled={patchProduct.isPending} onClick={() => void saveProduct()} sx={{ borderRadius: "999px" }}>
            {patchProduct.isPending ? "Saving…" : "Save product"}
          </Button>
        </Box>
      </Box>

      <Box sx={{ ...GLASS_SX, p: { xs: 2.25, md: 3 }, borderRadius: 1, display: "grid", gap: 1.5 }}>
        <Typography sx={{ fontWeight: 800 }}>Sub-products</Typography>
        <Typography variant="body2" color="text.secondary">
          Rename, archive branding, or keep a separate brand profile. There is no company-rename or permission-matrix API.
        </Typography>
        {subProducts.length === 0 ? (
          <Typography color="text.secondary">No sub-products yet.</Typography>
        ) : (
          subProducts.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.branding_mode === "separate_brand" ? "Separate brand" : "Uses product branding"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button size="small" onClick={() => openSub(item)}>
                  Edit
                </Button>
                {item.branding_mode === "separate_brand" ? (
                  <Button size="small" onClick={() => void openBrand(item)}>
                    Brand profile
                  </Button>
                ) : null}
                <Button size="small" color="error" onClick={() => void removeSub(item)}>
                  Delete
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Dialog open={Boolean(editingSub)} onClose={() => setEditingSub(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit sub-product</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            placeholder="Health Insurance"
            value={subName}
            onChange={(event) => setSubName(event.target.value)}
          />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Branding"
            value={subMode}
            onChange={(event) => setSubMode(event.target.value as SubProductBrandingMode)}
          >
            <MenuItem value="use_product_branding">Use product branding</MenuItem>
            <MenuItem value="separate_brand">Separate brand</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditingSub(null)}>Cancel</Button>
          <Button variant="contained" disabled={patchSub.isPending} onClick={() => void saveSub()}>
            {patchSub.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(brandOpen)} onClose={() => setBrandOpen(null)} fullWidth maxWidth="sm">
        <DialogTitle>{brandOpen?.name} brand</DialogTitle>
        <DialogContent>
          <TextField
            label="Brand name"
            fullWidth
            margin="normal"
            placeholder="Health Insurance"
            value={subBrand.name}
            onChange={(event) => setSubBrand((current) => ({ ...current, name: event.target.value }))}
          />
          <TextField
            label="Website"
            fullWidth
            margin="normal"
            placeholder="https://www.example.com"
            value={subBrand.website_url ?? ""}
            onChange={(event) => setSubBrand((current) => ({ ...current, website_url: event.target.value }))}
          />
          <TextField
            label="Target audience"
            fullWidth
            margin="normal"
            placeholder="Young families aged 25–40 in India"
            value={subBrand.audience_primary}
            onChange={(event) => setSubBrand((current) => ({ ...current, audience_primary: event.target.value }))}
          />
          <TextField
            label="Mandatory disclaimer"
            fullWidth
            margin="normal"
            placeholder="Insurance is the subject matter of solicitation."
            value={subBrand.compliance_mandatory_disclaimer ?? ""}
            onChange={(event) =>
              setSubBrand((current) => ({ ...current, compliance_mandatory_disclaimer: event.target.value }))
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBrandOpen(null)}>Cancel</Button>
          <Button variant="contained" disabled={brandBusy} onClick={() => void saveBrand()}>
            {brandBusy ? "Saving…" : "Save brand"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
