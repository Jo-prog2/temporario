<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="text-white" style="background-color: #0814a4;">
      <q-toolbar>
        <q-avatar rounded class="q-mr-sm bg-white">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW2S4gNNATLYxRJZI6CBIYnf0_Lb8TycUPOQ&s" alt="Logo" />
        </q-avatar>
        <q-toolbar-title>
          Manipulação de Arquivos KML
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page>
        <div class="q-ma-lg q-py-lg q-px-lg">
          <q-form @submit.prevent="fetchData">
            <q-card class="shadow-2 rounded">
              <q-card-section>
                <div class="row q-gutter-sm">
                  <!-- Select Cliente -->
                  <q-select
                    v-model="filters.cliente"
                    label="Cliente"
                    :options="clientes"
                    outlined
                    dense
                    class="col-3"
                    clearable
                  />
                  <!-- Select Bairro -->
                  <q-select
                    v-model="filters.bairro"
                    label="Bairro"
                    :options="bairros"
                    outlined
                    dense
                    class="col-3"
                    clearable
                  />
                  <!-- Select Situação -->
                  <q-select
                    v-model="filters.situacao"
                    label="Situação"
                    :options="situacoes"
                    outlined
                    dense
                    class="col-3"
                    clearable
                  />
                </div>
              </q-card-section>
              <q-card-actions align="right" class="bg-grey-2">
                <q-btn label="Filtrar" type="submit" color="primary" class="q-mr-sm" @click="fetchFilteredData" />
                <q-btn label="Limpar" type="reset" flat color="negative" @click="clearFilters" />
                <q-btn label="Baixar KML" flat color="primary" @click="baixarKml" />
              </q-card-actions>
            </q-card>
          </q-form>
          <!-- Tabela -->
          <q-table
  :rows="tableData"
  :columns="columns"
  :filter="tableFilter"
  class="shadow-1 rounded q-mt-md"
  dense
  title="Resultados da Pesquisa"
>
  <template v-slot:body-cell-actions="props">
    <q-td align="center">
      <q-btn
        dense
        flat
        round
        icon="map"
        color="primary"
        @click="openMapPopup(props.row)"
      />
    </q-td>
  </template>
  <template v-slot:top-right>
    <q-input
      v-model="tableFilter"
      placeholder="Pesquisar"
      dense
      outlined
      class="search bg-grey-1 rounded"
      debounce="300"
    >
      <template v-slot:prepend>
        <q-icon class="q-pl-sm" name="search" color="primary" />
      </template>
    </q-input>
  </template>
  <template v-slot:no-data>
    <div class="text-center text-grey-7 q-mt-lg">
      <q-icon name="warning" color="orange" size="42px" />
      <div class="text-h6 q-mt-md">Nenhum dado encontrado</div>
    </div>
  </template>
</q-table>
<q-dialog v-model="showMapDialog" persistent>
  <q-card class="q-pa-sm" style="max-width: 800px; width: 100%;">
    <q-card-section>
      <iframe
        width="100%"
        height="300"
        frameborder="0"
        scrolling="no"
        marginheight="0"
        marginwidth="0"
        :src="mapUrl"
      ></iframe>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="Fechar" color="primary" @click="showMapDialog = false" />
    </q-card-actions>
  </q-card>
</q-dialog>


        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { useQuasar } from 'quasar';
import { Notify } from "quasar"
export default {
  name: "KMLManipulationPage",
  setup() {
    const $q = useQuasar();
    const filters = reactive({
      cliente: "",
      bairro: "",
      situacao: "",
    });

    const tableData = ref([]);
    const tableFilter = ref("");
    const columns = reactive([
  { name: "cliente", label: "Cliente", align: "left", field: "cliente" },
  { name: "situacao", label: "Situação", align: "left", field: "situacao" },
  { name: "bairro", label: "Bairro", align: "left", field: "bairro" },
  { name: "referencia", label: "Referência", align: "left", field: "referencia" },
  { name: "ruaCruzamento", label: "Rua/Cruzamento", align: "left", field: "ruaCruzamento" },
  { name: "latitude", label: "Latitude", align: "right", field: "latitude" },
  { name: "longitude", label: "Longitude", align: "right", field: "longitude" },
  { name: "actions", label: "Ações", align: "center" },
]);



    const clientes = ref([]);
    const bairros = ref([]);
    const situacoes = ref([]);
    const showMapDialog = ref(false);
const mapUrl = ref("");

const openMapPopup = (row) => {
  const { latitude, longitude } = row;
  mapUrl.value = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude}432832161%2C${latitude}583626851%2C&layer=mapnik`;
  showMapDialog.value = true;
};

    const fetchFilters = async () => {
      try {
        const response = await axios.get(
          "https://apikmlmanipulation-19.onrender.com/api/placemarks/filters"
        );
        clientes.value = response.data.Clientes || [];
        bairros.value = response.data.Bairros || [];
        situacoes.value = response.data.Situacoes || [];
      } catch (error) {
        console.error("Erro ao buscar filtros:", error);
      }
    };

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://apikmlmanipulation-19.onrender.com/api/placemarks",
          { params: filters }
        );
        tableData.value = response.data;
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    const fetchFilteredData = async () => {
      try {
        // Filtra os parâmetros preenchidos
        const queryParams = Object.entries(filters)
          .filter(([key, value]) => value) // Mantém apenas os filtros com valores
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`) // Converte para chave=valor
          .join("&"); // Junta com & para formar a query string

        // Monta a URL com os parâmetros
        const url = `https://apikmlmanipulation-19.onrender.com/api/placemarks${queryParams ? `?${queryParams}` : ""}`;

        // Faz a chamada ao endpoint
        const response = await axios.get(url);

        // Atualiza os dados da tabela
        tableData.value = response.data;
      } catch (error) {
        console.error("Erro ao buscar dados filtrados:", error);
      }
    };

    const baixarKml = async () => {

  try {
    // Verifica se algum filtro foi preenchido
    const queryParams = Object.entries(filters)
      .filter(([key, value]) => value.trim() !== "") // Filtra os campos com valores não vazios
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`) // Converte para chave=valor
      .join("&"); // Junta os pares com "&"

    if (!queryParams) {
      // Exibe o alerta laranja se não houver filtros
      Notify.create({
        color: "orange",
        icon: "warning",
        message: "Nenhum filtro aplicado. Não há dados para exportar.",
        position: "top", // Alerta aparecerá no topo da tela
      });
      return;
    }

    // Monta a URL com os parâmetros de filtro
    const url = `https://apikmlmanipulation-19.onrender.com/api/placemarks/export?${queryParams}`;

    // Faz a requisição POST para a API
    const response = await axios.post(
      url,
      {}, // Corpo vazio, pode ser substituído por payload se necessário
      {
        responseType: "blob", // Define o tipo de resposta como blob para arquivos
      }
    );

    // Cria uma URL para o arquivo recebido
    const blob = new Blob([response.data], { type: "application/vnd.google-earth.kml+xml" });
    const downloadUrl = window.URL.createObjectURL(blob);

    // Cria um link para download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "export.kml"); // Define o nome do arquivo
    document.body.appendChild(link);
    link.click();

    // Limpa os recursos utilizados
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Erro ao baixar o arquivo KML:", error);
    Notify.create({
      color: "red",
      icon: "error",
      message: "Erro ao baixar o arquivo KML. Tente novamente mais tarde.",
      position: "top", // Alerta aparecerá no topo da tela
    });
  }
};



    const clearFilters = () => {
      Object.keys(filters).forEach((key) => (filters[key] = ""));
      tableData.value = [];
    };

    const editRow = (row) => {
      console.log("Editar linha:", row);
    };

    const deleteRow = (row) => {
      console.log("Excluir linha:", row);
    };

    onMounted(() => {
      fetchFilters();
    });

    return {
      filters,
      tableData,
      tableFilter,
      columns,
      clientes,
      bairros,
      situacoes,
      fetchData,
      clearFilters,
      editRow,
      deleteRow,
      baixarKml,
      $q,
      showMapDialog,
  mapUrl,
  openMapPopup,
    };
  },
};
</script>
<style scoped>
.q-card {
  background-color: #ffffff;
}
.q-table {
  background-color: #f9f9f9;
}
.search {
  min-width: 250px;
}
.q-card-actions {
  border-top: 1px solid #e0e0e0;
}
.text-center {
  padding: 20px;
}
.q-header {
  height: 60px;
}
.q-toolbar-title {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
